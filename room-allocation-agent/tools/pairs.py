from pydantic_ai import RunContext
from models.deps import AgentDeps
from models.result import AllocationResult


async def create_pair(
    ctx: RunContext[AgentDeps],
    registration_id_1: int,
    registration_id_2: int,
) -> AllocationResult:
    """
    Pair two seekers so they are always allocated to the same room.
    Both seekers must be unpaired currently.

    Args:
        registration_id_1: programRegistrationId of first seeker
        registration_id_2: programRegistrationId of second seeker
    """
    payload = {
        "programId": ctx.deps.program_id,
        "subProgramId": ctx.deps.sub_program_id,
        "registrationIds": [registration_id_1, registration_id_2],
        "remarks": "",
    }

    resp = await ctx.deps.http_client.post(
        f"{ctx.deps.nest_base_url}/registration-grouping/pair",
        json=payload,
        headers={"Authorization": ctx.deps.auth_header},
    )

    body = resp.json()
    status = body.get("statusCode", resp.status_code)
    ok = status == 201

    return AllocationResult(
        success=ok,
        message=body.get("message", ""),
        allocated_count=1 if ok else 0,
        failures=[] if ok else [body.get("message", "Pairing failed")],
    )


async def delete_pair(
    ctx: RunContext[AgentDeps],
    pair_id: int,
) -> AllocationResult:
    """
    Remove the pairing between two seekers.
    Use registrationPairId from the seeker's pair data.

    Args:
        pair_id: the registrationPairId (from seeker.registration_pair_id)
    """
    resp = await ctx.deps.http_client.delete(
        f"{ctx.deps.nest_base_url}/registration-grouping/pair/{pair_id}",
        headers={"Authorization": ctx.deps.auth_header},
    )

    body = resp.json()
    ok = resp.status_code == 200

    return AllocationResult(
        success=ok,
        message=body.get("message", ""),
        failures=[] if ok else [body.get("message", "Unpair failed")],
    )
