from pydantic_ai import RunContext
from models.deps import AgentDeps
from models.result import AllocationResult


async def allocate_seekers_to_room(
    ctx: RunContext[AgentDeps],
    registration_ids: list[int],
    room_inventory_id: int,
    start_bed_position: int = 1,
) -> AllocationResult:
    """
    Assign one or more seekers to a specific room.
    For paired seekers always pass both IDs together.

    Args:
        registration_ids: list of programRegistrationId values
        room_inventory_id: target room's roomInventoryId
        start_bed_position: first bed position to use (default 1; pass 2 if bed 1 is taken)
    """
    if not registration_ids:
        return AllocationResult(success=False, message="No registration IDs provided.")

    payload = {
        "programId": ctx.deps.program_id,
        "subProgramId": ctx.deps.sub_program_id,
        "roomInventoryId": room_inventory_id,
        "registrations": [
            {"registrationId": rid, "bedPosition": start_bed_position + i}
            for i, rid in enumerate(registration_ids)
        ],
    }

    resp = await ctx.deps.http_client.post(
        f"{ctx.deps.nest_base_url}/room-allocation",
        json=payload,
        headers={"Authorization": ctx.deps.auth_header},
    )

    body = resp.json()
    status = body.get("statusCode", resp.status_code)
    ok = status == 201

    if not ok:
        print(f"[alloc] FAIL ids={registration_ids} room={room_inventory_id} HTTP={resp.status_code} body={body}")

    return AllocationResult(
        success=ok,
        message=body.get("message", ""),
        allocated_count=len(registration_ids) if ok else 0,
        failed_count=0 if ok else len(registration_ids),
        failures=[] if ok else [body.get("message", "Unknown error")],
    )


async def move_seeker_to_room(
    ctx: RunContext[AgentDeps],
    allocation_ids: list[int],
    new_room_inventory_id: int,
) -> AllocationResult:
    """
    Move already-allocated seeker(s) to a different room.
    Pass both allocation IDs when moving a pair.

    Args:
        allocation_ids: list of roomAllocationId values to move
        new_room_inventory_id: destination room's roomInventoryId
    """
    if not allocation_ids:
        return AllocationResult(success=False, message="No allocation IDs provided.")

    payload = {
        "programId": ctx.deps.program_id,
        "subProgramId": ctx.deps.sub_program_id,
        "updateAllocations": [
            {
                "allocationId": aid,
                "newRoomInventoryId": new_room_inventory_id,
                "bedPosition": i + 1,
            }
            for i, aid in enumerate(allocation_ids)
        ],
    }

    resp = await ctx.deps.http_client.put(
        f"{ctx.deps.nest_base_url}/room-allocation",
        json=payload,
        headers={"Authorization": ctx.deps.auth_header},
    )

    body = resp.json()
    ok = resp.status_code == 200

    return AllocationResult(
        success=ok,
        message=body.get("message", ""),
        allocated_count=len(allocation_ids) if ok else 0,
        failed_count=0 if ok else len(allocation_ids),
        failures=[] if ok else [body.get("message", "Move failed")],
    )


async def unallocate_seekers(
    ctx: RunContext[AgentDeps],
    allocation_ids: list[int],
) -> AllocationResult:
    """
    Remove seekers from their currently assigned rooms.
    Use roomAllocationId values (not registrationIds).

    Args:
        allocation_ids: list of roomAllocationId values to remove
    """
    if not allocation_ids:
        return AllocationResult(success=True, message="Nothing to unallocate.")

    payload = {
        "programId": ctx.deps.program_id,
        "subProgramId": ctx.deps.sub_program_id,
        "allocationIds": allocation_ids,
    }

    resp = await ctx.deps.http_client.request(
        "DELETE",
        f"{ctx.deps.nest_base_url}/room-allocation",
        json=payload,
        headers={"Authorization": ctx.deps.auth_header},
    )

    body = resp.json()
    ok = resp.status_code == 200

    return AllocationResult(
        success=ok,
        message=body.get("message", ""),
        allocated_count=len(allocation_ids) if ok else 0,
        failed_count=0 if ok else len(allocation_ids),
        failures=[] if ok else [body.get("message", "Unallocate failed")],
    )
