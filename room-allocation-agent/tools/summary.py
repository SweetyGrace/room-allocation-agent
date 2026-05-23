from pydantic_ai import RunContext
from models.deps import AgentDeps


async def get_allocation_summary(ctx: RunContext[AgentDeps]) -> str:
    """
    Return a plain-text KPI snapshot of the current room allocation state:
    total rooms, occupied, available, reserved, and seeker allocation counts.
    Calls the same room-inventory endpoint that the frontend KPI cards use.
    """
    resp = await ctx.deps.http_client.get(
        f"{ctx.deps.nest_base_url}/room-inventory",
        params={
            "limit": 1,
            "offset": 0,
            "programId": ctx.deps.program_id,
            "subProgramId": ctx.deps.sub_program_id,
        },
        headers={"Authorization": ctx.deps.auth_header},
    )
    resp.raise_for_status()
    body = resp.json()
    data = body.get("data", {})

    kpis = data.get("kpis") or []
    total = data.get("total", "unknown")

    if not kpis:
        return f"Allocation summary unavailable. Total rooms in inventory: {total}."

    lines = ["Current room allocation summary:"]
    for kpi in kpis:
        label = kpi.get("label", kpi.get("key", "?"))
        count = kpi.get("count", "?")
        lines.append(f"  {label}: {count}")
    lines.append(f"  Total rooms in inventory: {total}")
    return "\n".join(lines)
