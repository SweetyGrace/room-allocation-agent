from pydantic_ai import Agent, RunContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai.providers.google_gla import GoogleGLAProvider
from config import GEMINI_API_KEY
from models.deps import AgentDeps
from models.seeker import SeekerInfo
from models.room import RoomInfo
from models.result import AllocationResult
from tools.seekers import get_unallocated_seekers, get_preferred_roommate_matches, search_all_seekers
from tools.rooms import get_available_rooms
from tools.allocations import allocate_seekers_to_room, move_seeker_to_room, unallocate_seekers
from tools.pairs import create_pair, delete_pair
from tools.orchestration import bulk_allocate_all, honor_all_preferred_roommates, unallocate_all, unallocate_floor, pair_roommates_on_floor, unpair_roommates_on_floor
from tools.summary import get_allocation_summary

SYSTEM_PROMPT = """
You are a room allocation assistant for the Infinitheism HDB/MSD program portal.
Admins type plain-language instructions and you execute them using the tools available.

---
HARD RULES — always enforced, never overridden by admin instructions:
1. Never place a male seeker and a female seeker in the same room.
2. Never allocate to a room that is full (remaining_occupancy == 0).
3. Never allocate to a reserved room (is_reserved == True).
4. If two seekers are paired (is_paired == True), always move or allocate both together — never one without the other.
5. Before executing a bulk action that affects more than 50 seekers, state exactly what you are about to do and wait for the admin to confirm with "yes" or "confirm".

---
WORKFLOW GUIDELINES:
- For "allocate all" type prompts: call tool_bulk_allocate_all directly — it handles pagination, gender separation, and pairs automatically.
- For "honor preferred roommates" type prompts: call tool_honor_all_preferred_roommates — it loops all seekers with preferences and pairs valid matches.
- For "how many rooms are allocated" / "give me a summary" type prompts: call tool_get_allocation_summary for a live KPI snapshot.
- For "pair X and Y" type prompts: use tool_search_all_seekers (not tool_get_unallocated_seekers) to find both seekers — they may already be allocated. Confirm identities if multiple matches, then call create_pair.
- For "move X to Y's room" type prompts: use tool_search_all_seekers to find both seekers regardless of allocation status.
- For "move X to Y's room" type prompts: find both seekers' current state, check room capacity and gender, then call move_seeker_to_room.
- For "clear floor X" / "remove all from ground floor" type prompts: call tool_unallocate_floor directly — it handles fetching occupied rooms and collecting all allocation IDs automatically.

---
WHEN MULTIPLE SEEKERS MATCH A NAME:
- Never ask "which Sweety?" without showing the options.
- Always list every match in this exact format, one per line:
    • <Full Name> | <age> yrs | <city>
- Example: "Multiple seekers named Sweety found:
    • Sweety Grace Penumala | 22 yrs | Hyderabad
    • Sweety Sharma | 30 yrs | Mumbai
  Please specify which one (e.g. 'Sweety from Hyderabad' or 'Sweety, 22 yrs')."
- Apply the same format for any tool that returns multiple candidates (rooms, seekers, etc.).

---
AFTER EVERY ACTION:
- Report exactly how many succeeded and how many failed.
- For each failure, state the seeker's name, the room, and the exact reason.
- Suggest next steps for unresolved cases where possible.

---
SCOPE:
- You are working on program_id and sub_program_id provided in your context.
- Never perform actions on any other program.
- All tool calls automatically use the correct program context — you do not need to pass it manually.
"""

room_agent = Agent(
    GeminiModel("gemini-2.5-flash", provider=GoogleGLAProvider(api_key=GEMINI_API_KEY)),
    deps_type=AgentDeps,
    system_prompt=SYSTEM_PROMPT,
)

# ── Register all tools ──────────────────────────────────────────────────────

@room_agent.tool
async def tool_get_unallocated_seekers(
    ctx: RunContext[AgentDeps],
    gender: str | None = None,
    city: str | None = None,
    search: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
) -> list[SeekerInfo]:
    """Fetch seekers who have not yet been assigned a room. Filter by gender, city, name, or age range (min_age/max_age)."""
    return await get_unallocated_seekers(ctx, gender=gender, city=city, search=search, min_age=min_age, max_age=max_age)


@room_agent.tool
async def tool_get_available_rooms(
    ctx: RunContext[AgentDeps],
    floor: str | None = None,
    block: str | None = None,
    gender: str | None = None,
    room_number: str | None = None,
    min_capacity: int = 1,
) -> list[RoomInfo]:
    """Fetch rooms with available beds. Filter by floor label, block label, existing occupant gender, or exact room number (e.g. '102'). Use min_capacity=2 for pairs."""
    return await get_available_rooms(ctx, floor=floor, block=block, gender=gender, room_number=room_number, min_capacity=min_capacity)


@room_agent.tool
async def tool_search_all_seekers(
    ctx: RunContext[AgentDeps],
    search: str,
    gender: str | None = None,
) -> list[SeekerInfo]:
    """
    Search for seekers by partial name across ALL seekers — both unallocated AND
    already allocated to rooms. Use this whenever you need to find a specific person
    by name, regardless of whether they have a room yet.
    Args:
        search: partial name to match (case-insensitive)
        gender: optional "M" or "F" to narrow results
    """
    return await search_all_seekers(ctx, search=search, gender=gender)


@room_agent.tool
async def tool_get_preferred_roommate_matches(
    ctx: RunContext[AgentDeps],
    seeker_id: int,
    preferred_name: str,
) -> list[SeekerInfo]:
    """Find seekers whose name matches a preferred roommate request for a given seeker."""
    return await get_preferred_roommate_matches(ctx, seeker_id=seeker_id, preferred_name=preferred_name)


@room_agent.tool
async def tool_allocate_seekers_to_room(
    ctx: RunContext[AgentDeps],
    registration_ids: list[int],
    room_inventory_id: int,
) -> AllocationResult:
    """Assign one or two seekers to a specific room by roomInventoryId. For paired seekers pass both IDs."""
    return await allocate_seekers_to_room(ctx, registration_ids=registration_ids, room_inventory_id=room_inventory_id)


@room_agent.tool
async def tool_move_seeker_to_room(
    ctx: RunContext[AgentDeps],
    allocation_ids: list[int],
    new_room_inventory_id: int,
) -> AllocationResult:
    """Move already-allocated seeker(s) to a different room using their roomAllocationId values."""
    return await move_seeker_to_room(ctx, allocation_ids=allocation_ids, new_room_inventory_id=new_room_inventory_id)


@room_agent.tool
async def tool_unallocate_seekers(
    ctx: RunContext[AgentDeps],
    allocation_ids: list[int],
) -> AllocationResult:
    """Remove seekers from their currently assigned rooms using roomAllocationId values."""
    return await unallocate_seekers(ctx, allocation_ids=allocation_ids)


@room_agent.tool
async def tool_create_pair(
    ctx: RunContext[AgentDeps],
    registration_id_1: int,
    registration_id_2: int,
) -> AllocationResult:
    """Pair two seekers together so they are always allocated to the same room."""
    return await create_pair(ctx, registration_id_1=registration_id_1, registration_id_2=registration_id_2)


@room_agent.tool
async def tool_delete_pair(
    ctx: RunContext[AgentDeps],
    pair_id: int,
) -> AllocationResult:
    """Remove the pairing between two seekers using their registrationPairId."""
    return await delete_pair(ctx, pair_id=pair_id)


@room_agent.tool
async def tool_bulk_allocate_all(
    ctx: RunContext[AgentDeps],
    gender_filter: str | None = None,
    floor: str | None = None,
    block: str | None = None,
    city: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
) -> str:
    """
    Allocate ALL unallocated seekers to available rooms in one operation.
    Paired seekers are placed together (requires a room with ≥2 free beds).
    Unpaired seekers fill remaining capacity.
    Gender rules are always enforced.
    Use gender_filter="M" or "F" to restrict to one gender only.
    Use floor="Ground" to restrict to a specific floor (e.g. "Ground", "First Floor").
    Use block="Alankritha" to restrict to a specific block.
    Use city="Hyderabad" to only allocate seekers from that city.
    Use min_age=40 for "above 40", max_age=60 for "below 60", or combine both for a range.
    """
    return await bulk_allocate_all(ctx, gender_filter=gender_filter, floor=floor, block=block, city=city, min_age=min_age, max_age=max_age)


@room_agent.tool
async def tool_honor_all_preferred_roommates(
    ctx: RunContext[AgentDeps],
) -> str:
    """
    Scan all unallocated seekers for preferred roommate requests and create pairs
    for every valid match (same gender, both unpaired).
    Call this before bulk_allocate_all so pairs are formed first.
    """
    return await honor_all_preferred_roommates(ctx)


@room_agent.tool
async def tool_get_allocation_summary(
    ctx: RunContext[AgentDeps],
) -> str:
    """
    Return a live KPI snapshot: total rooms, occupied, available, reserved,
    and seeker allocation counts for the current sub-program.
    """
    return await get_allocation_summary(ctx)


@room_agent.tool
async def tool_unallocate_all(
    ctx: RunContext[AgentDeps],
) -> str:
    """
    Remove ALL room allocations for every seeker across all floors in one operation.
    Use this for "unallocate everyone", "reset all allocations", "start fresh", etc.
    """
    return await unallocate_all(ctx)


@room_agent.tool
async def tool_unallocate_floor(
    ctx: RunContext[AgentDeps],
    floor: str,
    block: str | None = None,
    gender: str | None = None,
) -> str:
    """
    Remove ALL room allocations for every occupied room on a specific floor in one operation.
    Use this for "clear ground floor", "remove all from first floor", etc.
    Args:
        floor: floor label substring (e.g. "Ground", "First Floor", "Second")
        block: optional block label to narrow scope (e.g. "Alankritha")
        gender: "M" or "F" to only clear one gender's rooms on that floor
    """
    return await unallocate_floor(ctx, floor=floor, block=block, gender=gender)


@room_agent.tool
async def tool_pair_roommates_on_floor(
    ctx: RunContext[AgentDeps],
    floor: str,
    block: str | None = None,
) -> str:
    """
    For every room on a floor with exactly 2 occupants, formally pair those two people.
    Use this for "pair ground floor people", "pair roommates on first floor", etc.
    Rooms with only 1 occupant and already-paired rooms are skipped automatically.
    Args:
        floor: floor label substring (e.g. "Ground", "First Floor", "Second")
        block: optional block label to narrow scope
    """
    return await pair_roommates_on_floor(ctx, floor=floor, block=block)


@room_agent.tool
async def tool_unpair_roommates_on_floor(
    ctx: RunContext[AgentDeps],
    floor: str,
    block: str | None = None,
) -> str:
    """
    Remove all pairings for every paired seeker currently in rooms on a specific floor.
    Use this for "unpair ground floor people", "remove all pairings on first floor", etc.
    Args:
        floor: floor label substring (e.g. "Ground", "First Floor", "Second")
        block: optional block label to narrow scope
    """
    return await unpair_roommates_on_floor(ctx, floor=floor, block=block)
