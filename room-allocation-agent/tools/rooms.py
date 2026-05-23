from pydantic_ai import RunContext
from models.deps import AgentDeps
from models.room import RoomInfo


async def get_all_rooms(
    ctx: RunContext[AgentDeps],
    floor: str | None = None,
    block: str | None = None,
) -> list[RoomInfo]:
    """
    Fetch ALL rooms for the sub-program regardless of availability or status.
    Includes occupied, reserved, and available rooms with their current occupants.
    Used to collect allocation IDs for bulk unallocate operations.

    Args:
        floor: floor label substring filter (e.g. "Ground")
        block: block label substring filter (e.g. "Alankritha")
    """
    all_rooms: list[RoomInfo] = []
    offset = 0
    limit = 20

    while True:
        params: dict = {
            "limit": limit,
            "offset": offset,
            "programId": ctx.deps.program_id,
            "subProgramId": ctx.deps.sub_program_id,
        }

        resp = await ctx.deps.http_client.get(
            f"{ctx.deps.nest_base_url}/room-inventory",
            params=params,
            headers={"Authorization": ctx.deps.auth_header},
        )
        resp.raise_for_status()
        body = resp.json()
        raw_rooms = (body.get("data") or {}).get("data") or []

        if not raw_rooms:
            break

        for raw in raw_rooms:
            try:
                all_rooms.append(RoomInfo.from_api(raw))
            except Exception:
                pass

        if len(raw_rooms) < limit:
            break
        offset += limit

    result = []
    for room in all_rooms:
        if floor and floor.lower() not in room.floor.lower():
            continue
        if block and room.block and block.lower() not in room.block.lower():
            continue
        result.append(room)

    return result


async def get_available_rooms(
    ctx: RunContext[AgentDeps],
    floor: str | None = None,
    block: str | None = None,
    gender: str | None = None,
    room_number: str | None = None,
    min_capacity: int = 1,
) -> list[RoomInfo]:
    """
    Fetch rooms that have available beds for this sub-program.
    Always excludes reserved rooms and full rooms.
    All filtering is applied in Python after fetching.

    Args:
        floor: floor label substring to filter (e.g. "Ground")
        block: block label substring to filter (e.g. "Alankritha")
        gender: "M" or "F" — only return rooms where ALL existing occupants share this gender
        room_number: exact or partial room number to find a specific room (e.g. "102")
        min_capacity: minimum remaining beds needed (default 1, use 2 for pairs)
    """
    all_rooms: list[RoomInfo] = []
    offset = 0
    limit = 20

    while True:
        params: dict = {
            "limit": limit,
            "offset": offset,
            "programId": ctx.deps.program_id,
            "subProgramId": ctx.deps.sub_program_id,
        }

        resp = await ctx.deps.http_client.get(
            f"{ctx.deps.nest_base_url}/room-inventory",
            params=params,
            headers={"Authorization": ctx.deps.auth_header},
        )
        resp.raise_for_status()
        body = resp.json()
        raw_rooms = (body.get("data") or {}).get("data") or []

        if not raw_rooms:
            break

        for raw in raw_rooms:
            try:
                all_rooms.append(RoomInfo.from_api(raw))
            except Exception:
                pass

        if len(raw_rooms) < limit:
            break
        offset += limit

    result = []
    for room in all_rooms:
        if room.is_reserved:
            continue
        if room.remaining_occupancy < min_capacity:
            continue
        if room_number and room_number not in room.room_id:
            continue
        if floor and floor.lower() not in room.floor.lower():
            continue
        if block and room.block and block.lower() not in room.block.lower():
            continue
        if gender:
            occupant_genders = {o.gender for o in room.occupants}
            # If the room has occupants of the opposite gender, skip it
            opposite = "F" if gender == "M" else "M"
            if opposite in occupant_genders:
                continue
        result.append(room)

    return result
