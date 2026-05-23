from pydantic_ai import RunContext
from models.deps import AgentDeps
from tools.seekers import get_unallocated_seekers, get_preferred_roommate_matches
from tools.rooms import get_available_rooms, get_all_rooms
from tools.allocations import allocate_seekers_to_room, unallocate_seekers
from tools.pairs import create_pair, delete_pair


async def bulk_allocate_all(
    ctx: RunContext[AgentDeps],
    gender_filter: str | None = None,
    floor: str | None = None,
    block: str | None = None,
    city: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
) -> str:
    """
    Allocate every unallocated seeker to an available room.
    Paired seekers are always placed together in rooms with ≥2 free beds.
    Unpaired seekers fill remaining capacity afterward.
    Male and female seekers are never mixed.

    Args:
        gender_filter: "M" or "F" to restrict to one gender. None = do both.
        floor: restrict allocation to rooms on this floor (e.g. "Ground", "First").
        block: restrict allocation to rooms in this block (e.g. "Alankritha").
        city: restrict to seekers from this city (e.g. "Hyderabad", "Chennai").
        min_age: only allocate seekers this age or older (e.g. 40 for "above 40").
        max_age: only allocate seekers this age or younger.
    """
    genders = [gender_filter] if gender_filter else ["M", "F"]

    total_allocated = 0
    total_failed = 0
    failures: list[str] = []

    for gender in genders:
        seekers = await get_unallocated_seekers(ctx, gender=gender, city=city, min_age=min_age, max_age=max_age)
        if not seekers:
            continue

        # Split into paired groups and unpaired individuals.
        # For paired seekers, collect both members as one unit (avoid duplicates).
        seen_pair_codes: set[int] = set()
        paired_groups: list[list] = []
        unpaired: list = []

        for s in seekers:
            print(f"[bulk] seeker={s.name} id={s.id} gender={s.gender} is_paired={s.is_paired} pair_code={s.pair_code}")
            if s.is_paired and s.pair_code is not None:
                if s.pair_code not in seen_pair_codes:
                    seen_pair_codes.add(s.pair_code)
                    partner = next(
                        (o for o in seekers if o.pair_code == s.pair_code and o.id != s.id),
                        None,
                    )
                    if partner:
                        print(f"[bulk] pair found: {s.name} + {partner.name}")
                        paired_groups.append([s, partner])
                    else:
                        print(f"[bulk] {s.name}: partner not in unallocated list, treating as solo")
                        unpaired.append(s)
                # If pair_code already seen, this seeker is already captured inside paired_groups
                # as the partner of the first member — no action needed here.
            elif not s.is_paired:
                unpaired.append(s)

        # Fetch rooms once per gender; sort by remaining occupancy descending
        # so we fill larger rooms first and avoid leaving orphan single beds.
        rooms = await get_available_rooms(ctx, gender=gender, floor=floor, block=block)
        rooms.sort(key=lambda r: r.remaining_occupancy, reverse=True)

        # --- Allocate pairs first (need ≥2 beds) ---
        # Send both paired members in one API call — NestJS accepts multi-registration
        # calls only when the seekers are actually paired in the DB.
        # Fall back to individual allocation if no room with ≥2 beds is available.
        fallback_queue: list = []
        for pair in paired_groups:
            room = next((r for r in rooms if r.remaining_occupancy >= 2), None)
            if room is None:
                print(f"[bulk] no room with ≥2 beds for pair {[s.name for s in pair]}, adding to fallback")
                fallback_queue.extend(pair)
                continue

            start_pos = room.capacity - room.remaining_occupancy + 1
            result = await allocate_seekers_to_room(
                ctx,
                registration_ids=[s.id for s in pair],
                room_inventory_id=room.room_inventory_id,
                start_bed_position=start_pos,
            )
            if result.success:
                total_allocated += 2
                room.remaining_occupancy -= 2
            else:
                print(f"[bulk] pair {[s.name for s in pair]} failed ({result.message}), trying individually")
                # Fall back: allocate each member individually to the same room
                for s in pair:
                    bed_pos = room.capacity - room.remaining_occupancy + 1
                    r2 = await allocate_seekers_to_room(
                        ctx,
                        registration_ids=[s.id],
                        room_inventory_id=room.room_inventory_id,
                        start_bed_position=bed_pos,
                    )
                    if r2.success:
                        total_allocated += 1
                        room.remaining_occupancy -= 1
                    else:
                        print(f"[bulk] individual fallback also failed for {s.name}: {r2.message}")
                        fallback_queue.append(s)

        # --- Allocate unpaired individuals + pair fallbacks: one API call per seeker ---
        # One seeker per call with the correct bedPosition.
        # We iterate rooms and fill each completely before moving to the next room.
        seeker_queue = list(unpaired) + fallback_queue
        for room in rooms:
            if not seeker_queue:
                break
            if room.remaining_occupancy < 1:
                continue

            while room.remaining_occupancy > 0 and seeker_queue:
                seeker = seeker_queue.pop(0)
                # Bed position = first free slot (beds fill from 1 upward)
                bed_pos = room.capacity - room.remaining_occupancy + 1

                result = await allocate_seekers_to_room(
                    ctx,
                    registration_ids=[seeker.id],
                    room_inventory_id=room.room_inventory_id,
                    start_bed_position=bed_pos,
                )
                if result.success:
                    total_allocated += 1
                    room.remaining_occupancy -= 1
                else:
                    total_failed += 1
                    failures.append(f"{seeker.name}: {result.message}")
                    # If the room itself is bad, stop filling it
                    if "room" in result.message.lower() or "capacity" in result.message.lower():
                        break

        # Any seekers left in the queue had no room
        for s in seeker_queue:
            failures.append(f"{s.name}: no available room ({gender})")
            total_failed += 1

    lines = [f"Bulk allocation complete: {total_allocated} allocated, {total_failed} failed."]
    if failures:
        lines.append("\nFailures:")
        for f in failures[:20]:
            lines.append(f"  - {f}")
        if len(failures) > 20:
            lines.append(f"  ... and {len(failures) - 20} more.")
    return "\n".join(lines)


async def honor_all_preferred_roommates(
    ctx: RunContext[AgentDeps],
) -> str:
    """
    For every unallocated seeker who requested a preferred roommate,
    find a matching seeker and pair them.

    A match is valid when:
    - The matched seeker has the same gender as the requester.
    - Neither is already paired.
    """
    seekers = await get_unallocated_seekers(ctx)

    with_preference = [s for s in seekers if s.preferred_room_mate]
    if not with_preference:
        return "No unallocated seekers with preferred roommate requests found."

    paired_this_run: set[int] = set()
    pairs_created = 0
    skipped = 0
    failures: list[str] = []
    skip_reasons: list[str] = []

    for seeker in with_preference:
        if seeker.id in paired_this_run:
            continue
        if seeker.is_paired:
            skip_reasons.append(f"{seeker.name}: already paired with someone else")
            skipped += 1
            continue

        matches = await get_preferred_roommate_matches(
            ctx,
            seeker_id=seeker.id,
            preferred_name=seeker.preferred_room_mate,
        )

        valid = [
            m for m in matches
            if m.gender == seeker.gender
            and not m.is_paired
            and m.id not in paired_this_run
        ]

        if not valid:
            skip_reasons.append(
                f"{seeker.name} (preferred: '{seeker.preferred_room_mate}'): no valid match found"
            )
            skipped += 1
            continue

        match = valid[0]
        result = await create_pair(
            ctx,
            registration_id_1=seeker.id,
            registration_id_2=match.id,
        )

        if result.success:
            pairs_created += 1
            paired_this_run.add(seeker.id)
            paired_this_run.add(match.id)
        else:
            failures.append(f"{seeker.name} ↔ {match.name}: {result.message}")

    lines = [
        f"Preferred roommate pairing: {pairs_created} pair(s) created, "
        f"{skipped} skipped, {len(failures)} failed."
    ]
    if skip_reasons:
        lines.append("\nSkipped:")
        for r in skip_reasons[:10]:
            lines.append(f"  - {r}")
    if failures:
        lines.append("\nFailures:")
        for f in failures[:10]:
            lines.append(f"  - {f}")
    return "\n".join(lines)


async def unallocate_all(
    ctx: RunContext[AgentDeps],
) -> str:
    """
    Remove ALL room allocations for every occupied room across all floors.
    """
    rooms = await get_all_rooms(ctx)

    allocation_ids: list[int] = []
    seeker_names: list[str] = []

    for room in rooms:
        for occupant in room.occupants:
            if occupant.room_allocation_id is not None:
                allocation_ids.append(occupant.room_allocation_id)
                seeker_names.append(occupant.name)

    if not allocation_ids:
        return "No allocated seekers found — everyone is already unallocated."

    result = await unallocate_seekers(ctx, allocation_ids=allocation_ids)

    if result.success:
        return (
            f"Unallocated all {len(allocation_ids)} seeker(s) across all floors: "
            + ", ".join(seeker_names[:10])
            + (f" ... and {len(seeker_names) - 10} more." if len(seeker_names) > 10 else ".")
        )
    else:
        return f"Unallocate failed: {result.message}"


async def unallocate_floor(
    ctx: RunContext[AgentDeps],
    floor: str,
    block: str | None = None,
    gender: str | None = None,
) -> str:
    """
    Remove all room allocations for every occupied room on a specific floor.
    Collects all roomAllocationId values from occupants and calls unallocate in batches.

    Args:
        floor: floor label substring (e.g. "Ground", "First Floor")
        block: optional block label substring to narrow scope
        gender: "M" or "F" to only unallocate one gender's rooms
    """
    rooms = await get_all_rooms(ctx, floor=floor, block=block)

    allocation_ids: list[int] = []
    seeker_names: list[str] = []

    for room in rooms:
        for occupant in room.occupants:
            if gender and occupant.gender != gender:
                continue
            if occupant.room_allocation_id is not None:
                allocation_ids.append(occupant.room_allocation_id)
                seeker_names.append(occupant.name)

    if not allocation_ids:
        return f"No allocated seekers found on floor matching '{floor}'."

    result = await unallocate_seekers(ctx, allocation_ids=allocation_ids)

    if result.success:
        return (
            f"Unallocated {len(allocation_ids)} seeker(s) from floor '{floor}': "
            + ", ".join(seeker_names[:10])
            + (f" ... and {len(seeker_names) - 10} more." if len(seeker_names) > 10 else ".")
        )
    else:
        return f"Unallocate failed: {result.message}"


async def pair_roommates_on_floor(
    ctx: RunContext[AgentDeps],
    floor: str,
    block: str | None = None,
) -> str:
    """
    For every room on a floor that has exactly 2 occupants, create a pair
    between those two occupants so they are formally linked as roommates.
    Rooms with 0 or 1 occupant are skipped.
    Already-paired occupants are skipped gracefully.

    Args:
        floor: floor label substring (e.g. "Ground", "First Floor")
        block: optional block label substring to narrow scope
    """
    rooms = await get_all_rooms(ctx, floor=floor, block=block)

    pairs_created = 0
    skipped_rooms = 0
    already_paired = 0
    failures: list[str] = []

    for room in rooms:
        occupants = [o for o in room.occupants if o.id is not None]

        if len(occupants) != 2:
            skipped_rooms += 1
            continue

        a, b = occupants[0], occupants[1]

        # Skip if either is already paired
        if a.is_paired or b.is_paired:
            already_paired += 1
            continue

        result = await create_pair(
            ctx,
            registration_id_1=a.id,
            registration_id_2=b.id,
        )

        if result.success:
            pairs_created += 1
        else:
            failures.append(f"Room {room.room_id} ({a.name} & {b.name}): {result.message}")

    lines = [
        f"Floor pairing complete: {pairs_created} pair(s) created, "
        f"{already_paired} room(s) skipped (already paired), "
        f"{skipped_rooms} room(s) skipped (not exactly 2 occupants)."
    ]
    if failures:
        lines.append("\nFailures:")
        for f in failures[:10]:
            lines.append(f"  - {f}")
    return "\n".join(lines)


async def unpair_roommates_on_floor(
    ctx: RunContext[AgentDeps],
    floor: str,
    block: str | None = None,
) -> str:
    """
    Remove all pairings for every paired seeker currently occupying rooms on a specific floor.
    Collects unique registrationPairId values from occupants and calls delete_pair for each.

    NOTE: This requires that the room-inventory response includes pairCode/registrationPairMaps
    in the nested registration objects. If pair data is missing from that response, zero pairs
    will be found and the message will say so.

    Args:
        floor: floor label substring (e.g. "Ground", "First Floor")
        block: optional block label to narrow scope
    """
    rooms = await get_all_rooms(ctx, floor=floor, block=block)

    # Collect unique pair IDs — avoid calling delete twice for the same pair
    seen_pair_codes: set[int] = set()
    pair_ids_to_delete: list[tuple[int, str, str]] = []  # (pair_id, name_a, name_b)

    for room in rooms:
        paired_occupants = [o for o in room.occupants if o.is_paired and o.registration_pair_id is not None]
        for occupant in paired_occupants:
            if occupant.pair_code not in seen_pair_codes:
                seen_pair_codes.add(occupant.pair_code)
                # Try to find the partner name for a nicer report
                partner = next(
                    (o for o in room.occupants if o.pair_code == occupant.pair_code and o.id != occupant.id),
                    None,
                )
                partner_name = partner.name if partner else "unknown"
                pair_ids_to_delete.append((occupant.registration_pair_id, occupant.name, partner_name))

    if not pair_ids_to_delete:
        return (
            f"No paired seekers found on floor '{floor}'. "
            "Either nobody is paired, or pair data is not included in room-inventory response."
        )

    unpaired_count = 0
    failures: list[str] = []

    for pair_id, name_a, name_b in pair_ids_to_delete:
        result = await delete_pair(ctx, pair_id=pair_id)
        if result.success:
            unpaired_count += 1
        else:
            failures.append(f"{name_a} & {name_b} (pair_id={pair_id}): {result.message}")

    lines = [f"Floor unpairing complete: {unpaired_count} pair(s) removed, {len(failures)} failed."]
    if failures:
        lines.append("\nFailures:")
        for f in failures[:10]:
            lines.append(f"  - {f}")
    return "\n".join(lines)
