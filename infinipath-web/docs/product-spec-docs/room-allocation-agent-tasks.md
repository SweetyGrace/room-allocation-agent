# Room Allocation Agent — User Stories & Tasks

---

## GENERATION METADATA

| Field | Value |
|---|---|
| **Module** | Room Allocation AI Agent |
| **BRD Version** | v1.0 |
| **PRD Version** | v1.0 |
| **Generated On** | 2026-05-22 |
| **Platform Scope** | Python Agent Service (FastAPI + PydanticAI), Web (React) |
| **Total Epics** | 5 |
| **Total Stories** | 14 |
| **Total Tasks** | 32 |
| **Third-Party Integrations** | Anthropic API (Claude Sonnet 4.6) |
| **UAT Required Tasks** | 12 |
| **Total Story Points** | 121 |

---

## EPIC INDEX

| Epic ID | Title | Platform | Points |
|---|---|---|---|
| EPIC-AGENT-001 | Agent Service Infrastructure | Python | 21 |
| EPIC-AGENT-002 | Allocation & Unallocation Tools | Python | 26 |
| EPIC-AGENT-003 | Pairing & Preferred Roommate Tools | Python | 18 |
| EPIC-AGENT-004 | Agent Prompt & Conflict Handling | Python | 24 |
| EPIC-AGENT-005 | Frontend Integration | React | 32 |

---

---

## EPIC-AGENT-001 — Agent Service Infrastructure

| Field | Value |
|---|---|
| **Epic ID** | EPIC-AGENT-001 |
| **Title** | Agent Service Infrastructure |
| **Type** | Technical Infrastructure |
| **Description** | Set up the standalone Python microservice with FastAPI, PydanticAI, async HTTP client, environment config, and the base agent scaffold. This is the foundation everything else builds on. |
| **Platform Scope** | Python |
| **PRD Ref** | PRD §7 Agent Service Architecture |
| **Dependencies** | None |

---

### [STORY-001-01] Project Scaffold & Configuration

| Field | Value |
|---|---|
| **Story ID** | STORY-001-01 |
| **Title** | Set up FastAPI + PydanticAI Python project |
| **As a** | Developer |
| **I want** | a runnable Python service with all dependencies installed |
| **So that** | other tasks have a working base to build on |
| **Story Points** | 3 |
| **Priority** | Critical |

---

#### [TASK-001-01-01] Initialise Python project structure

| Field | Value |
|---|---|
| **Task ID** | TASK-001-01-01 |
| **Title** | Initialise Python project structure |
| **Task Type** | Infrastructure |
| **Platform** | Python |
| **Story Points** | 2 |
| **Priority** | Critical |
| **UAT Required** | No |

**Description:**
Create the project directory structure:
```
room-allocation-agent/
├── main.py
├── agent.py
├── config.py
├── tools/
│   ├── __init__.py
│   ├── seekers.py
│   ├── rooms.py
│   ├── allocations.py
│   └── pairs.py
├── models/
│   ├── __init__.py
│   ├── deps.py
│   ├── seeker.py
│   ├── room.py
│   └── result.py
├── requirements.txt
└── .env.example
```

**Acceptance Criteria:**
- `requirements.txt` includes: `pydantic-ai`, `fastapi`, `uvicorn`, `httpx`, `pydantic`, `python-dotenv`
- `.env.example` documents: `ANTHROPIC_API_KEY`, `NEST_BASE_URL`
- `main.py` runs with `uvicorn main:app --reload` without errors

---

#### [TASK-001-01-02] Implement AgentDeps and Pydantic models

| Field | Value |
|---|---|
| **Task ID** | TASK-001-01-02 |
| **Title** | Implement AgentDeps dataclass and all Pydantic models |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 1 |
| **Priority** | Critical |
| **UAT Required** | No |

**Description:**
Implement the following in `models/`:

`deps.py`:
```python
@dataclass
class AgentDeps:
    nest_base_url: str
    auth_token: str
    program_id: int
    sub_program_id: int
    http_client: httpx.AsyncClient
```

`seeker.py` — `SeekerInfo` with fields: `id`, `name`, `gender`, `city`, `age`, `is_paired`, `pair_code`, `registration_pair_id`, `preferred_room_mate`, `room_allocation_id`

`room.py` — `RoomInfo` with fields: `room_inventory_id`, `room_id`, `floor`, `capacity`, `remaining_occupancy`, `is_reserved`, `room_status`, `occupants: list[SeekerInfo]`

`result.py` — `AllocationResult` with fields: `success`, `message`, `allocated_count`, `failed_count`, `failures: list[str]`

**Acceptance Criteria:**
- All models instantiate correctly from sample NestJS API response JSON
- No validation errors on typical payloads

---

### [STORY-001-02] FastAPI Streaming Endpoint

| Field | Value |
|---|---|
| **Story ID** | STORY-001-02 |
| **Title** | Expose SSE streaming endpoint for agent queries |
| **As a** | Frontend developer |
| **I want** | a POST endpoint that streams agent responses as SSE |
| **So that** | the React AIOverlay can display tokens as they arrive |
| **Story Points** | 5 |
| **Priority** | Critical |

---

#### [TASK-001-02-01] Implement /agent/room-allocation/query endpoint

| Field | Value |
|---|---|
| **Task ID** | TASK-001-02-01 |
| **Title** | Implement streaming FastAPI endpoint |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 3 |
| **Priority** | Critical |
| **UAT Required** | No |
| **PRD Ref** | PRD §5 API Contract |

**Description:**
In `main.py`, implement:

```python
class AgentRequest(BaseModel):
    prompt: str
    program_id: int
    sub_program_id: int
    auth_token: str

@app.post("/agent/room-allocation/query")
async def run_room_agent(req: AgentRequest):
    async def event_stream():
        async with httpx.AsyncClient(timeout=60.0) as client:
            deps = AgentDeps(
                nest_base_url=settings.NEST_BASE_URL,
                auth_token=req.auth_token,
                program_id=req.program_id,
                sub_program_id=req.sub_program_id,
                http_client=client,
            )
            async with room_agent.run_stream(req.prompt, deps=deps) as result:
                async for text in result.stream():
                    yield f"data: {text}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

**Acceptance Criteria:**
- Endpoint returns `Content-Type: text/event-stream`
- First SSE token arrives within 2 seconds
- Endpoint returns 503 with JSON error if agent service is unavailable

---

#### [TASK-001-02-02] Add CORS and auth header forwarding

| Field | Value |
|---|---|
| **Task ID** | TASK-001-02-02 |
| **Title** | Configure CORS and validate auth token presence |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | No |

**Description:**
- Add `CORSMiddleware` allowing requests from the React app origin
- Validate that `auth_token` is non-empty before running agent — return 401 if missing
- All outbound `httpx` calls to NestJS must include `Authorization: Bearer {auth_token}` header

**Acceptance Criteria:**
- React app can reach the endpoint without CORS errors
- Empty `auth_token` returns HTTP 401 before the agent runs

---

---

## EPIC-AGENT-002 — Allocation & Unallocation Tools

| Field | Value |
|---|---|
| **Epic ID** | EPIC-AGENT-002 |
| **Title** | Allocation & Unallocation Tools |
| **Type** | Feature |
| **Description** | Implement the PydanticAI tools that get seekers, get rooms, allocate, move, and unallocate. These are the core action tools the agent uses for all allocation features. |
| **Platform Scope** | Python |
| **PRD Ref** | PRD §6 Agent Tools, Features 1, 2, 5, 6 |
| **Dependencies** | EPIC-AGENT-001 |

---

### [STORY-002-01] Fetch Seekers and Rooms

| Field | Value |
|---|---|
| **Story ID** | STORY-002-01 |
| **Title** | Implement tools to fetch unallocated seekers and available rooms |
| **As an** | Agent |
| **I want** | to query current seeker and room state from NestJS |
| **So that** | I can make informed allocation decisions |
| **Story Points** | 8 |
| **Priority** | Critical |

---

#### [TASK-002-01-01] Implement get_unallocated_seekers tool

| Field | Value |
|---|---|
| **Task ID** | TASK-002-01-01 |
| **Title** | Implement get_unallocated_seekers tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 4 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `get_unallocated_seekers` |

**Description:**
In `tools/seekers.py`, implement a PydanticAI tool that calls:
`GET /room-allocation/registrations?limit=100&offset=0&programId={id}&filters={...}`

Params:
- `gender` (optional): passed as `filters.gender = [value]`
- `city` (optional): passed as `filters.location = [value]`
- `allocatedProgramId`: always `[sub_program_id]`
- Handles pagination — fetches all pages until no more results

Returns: `list[SeekerInfo]`

**Acceptance Criteria:**
- Tool returns all unallocated seekers across all pages
- Gender and city filters produce correct filtered results
- Empty result returns `[]` not an error

---

#### [TASK-002-01-02] Implement get_available_rooms tool

| Field | Value |
|---|---|
| **Task ID** | TASK-002-01-02 |
| **Title** | Implement get_available_rooms tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 4 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `get_available_rooms` |

**Description:**
In `tools/rooms.py`, implement a PydanticAI tool that calls:
`GET /room-inventory?limit=200&offset=0&programId={id}&subProgramId={id}&filters={...}`

Params:
- `floor` (optional): passed as `filters.floor = [value]`
- `gender` (optional): passed as `filters.gender = [value]`
- `min_capacity` (default 1): filters out rooms with `remaining_occupancy < min_capacity`

Post-filter in Python: exclude reserved rooms (`is_reserved == true`)

Returns: `list[RoomInfo]` — only rooms with space and not reserved

**Acceptance Criteria:**
- Tool never returns a reserved room
- Tool never returns a full room
- Floor filter correctly limits results to that floor

---

### [STORY-002-02] Allocate, Move, Unallocate

| Field | Value |
|---|---|
| **Story ID** | STORY-002-02 |
| **Title** | Implement tools to allocate, move, and clear seekers |
| **As an** | Agent |
| **I want** | to call NestJS APIs to assign, reassign, and remove seekers from rooms |
| **So that** | I can execute the admin's allocation instructions |
| **Story Points** | 10 |
| **Priority** | Critical |

---

#### [TASK-002-02-01] Implement allocate_seekers_to_room tool

| Field | Value |
|---|---|
| **Task ID** | TASK-002-02-01 |
| **Title** | Implement allocate_seekers_to_room tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 3 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `allocate_seekers_to_room` |

**Description:**
In `tools/allocations.py`, implement a PydanticAI tool that calls:
`POST /room-allocation`

Payload:
```json
{
  "programId": <int>,
  "subProgramId": <int>,
  "roomInventoryId": <int>,
  "registrations": [
    {"registrationId": <id1>, "bedPosition": 1},
    {"registrationId": <id2>, "bedPosition": 2}
  ]
}
```

Returns: `AllocationResult` — success/fail with message

**Acceptance Criteria:**
- Successful allocation returns `success=True` and `allocated_count` equal to input count
- NestJS 4xx response is captured and returned as `AllocationResult(success=False, message=...)`
- Tool never called with more than room's `remaining_occupancy` seekers

---

#### [TASK-002-02-02] Implement move_seeker_to_room tool

| Field | Value |
|---|---|
| **Task ID** | TASK-002-02-02 |
| **Title** | Implement move_seeker_to_room tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 3 |
| **Priority** | High |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `move_seeker_to_room` |

**Description:**
In `tools/allocations.py`, implement a PydanticAI tool that calls:
`PUT /room-allocation`

Payload:
```json
{
  "programId": <int>,
  "subProgramId": <int>,
  "updateAllocations": [
    {"allocationId": <id>, "newRoomInventoryId": <room_id>, "bedPosition": 1}
  ]
}
```

**Acceptance Criteria:**
- Seeker is moved; old room shows freed bed, new room shows seeker
- If seeker is paired, both `allocationId`s are included in the payload

---

#### [TASK-002-02-03] Implement unallocate_seekers tool

| Field | Value |
|---|---|
| **Task ID** | TASK-002-02-03 |
| **Title** | Implement unallocate_seekers tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `unallocate_seekers` |

**Description:**
In `tools/allocations.py`, implement a PydanticAI tool that calls:
`DELETE /room-allocation`

Payload:
```json
{
  "programId": <int>,
  "subProgramId": <int>,
  "allocationIds": [<id1>, <id2>, ...]
}
```

**Acceptance Criteria:**
- Seekers appear back in the unallocated list after tool runs
- Tool handles empty `allocationIds` by returning early without calling the API

---

#### [TASK-002-02-04] Bulk allocation loop with batch sizing

| Field | Value |
|---|---|
| **Task ID** | TASK-002-02-04 |
| **Title** | Implement bulk allocation orchestration in agent |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | Yes |

**Description:**
The agent must handle bulk allocation correctly when the prompt is "allocate all seekers":
- Call `get_unallocated_seekers` with pagination to get ALL seekers (not just first 100)
- For paired seekers: always call `allocate_seekers_to_room` with both IDs together
- For unpaired seekers: fill rooms up to capacity, never exceed `remaining_occupancy`
- Stream intermediate progress: "Allocated 50/200 seekers..."
- Collect all failures and report at the end

**Acceptance Criteria:**
- 300-seeker bulk allocation completes in < 30 seconds
- No room is over-allocated (exceeds capacity)
- Paired seekers always end up in the same room

---

---

## EPIC-AGENT-003 — Pairing & Preferred Roommate Tools

| Field | Value |
|---|---|
| **Epic ID** | EPIC-AGENT-003 |
| **Title** | Pairing & Preferred Roommate Tools |
| **Type** | Feature |
| **Description** | Implement tools for creating and deleting seeker pairs, and for resolving preferred roommate requests. |
| **Platform Scope** | Python |
| **PRD Ref** | PRD Features 3, 4, 7 |
| **Dependencies** | EPIC-AGENT-001 |

---

### [STORY-003-01] Pair and Unpair Seekers

| Field | Value |
|---|---|
| **Story ID** | STORY-003-01 |
| **Title** | Implement create_pair and delete_pair tools |
| **As an** | Agent |
| **I want** | to pair and unpair seekers via NestJS |
| **So that** | admins can say "pair Arun and Vikram" and it happens |
| **Story Points** | 6 |
| **Priority** | High |

---

#### [TASK-003-01-01] Implement create_pair tool

| Field | Value |
|---|---|
| **Task ID** | TASK-003-01-01 |
| **Title** | Implement create_pair tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 3 |
| **Priority** | High |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `create_pair` |

**Description:**
In `tools/pairs.py`, implement a PydanticAI tool that calls:
`POST /registration-grouping/pair`

Payload:
```json
{
  "programId": <int>,
  "subProgramId": <int>,
  "registrationIds": [<id1>, <id2>],
  "remarks": ""
}
```

Agent must search for seekers by name using `get_unallocated_seekers` before calling this tool when admin gives names instead of IDs. If name returns multiple matches, the agent must list matches and ask the admin to confirm.

**Acceptance Criteria:**
- NestJS 201 response → `AllocationResult(success=True)`
- NestJS 4xx response → `AllocationResult(success=False, message=<reason>)`
- If either seeker is already paired, tool returns failure with current pair info

---

#### [TASK-003-01-02] Implement delete_pair tool

| Field | Value |
|---|---|
| **Task ID** | TASK-003-01-02 |
| **Title** | Implement delete_pair tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `delete_pair` |

**Description:**
In `tools/pairs.py`, implement:
`DELETE /registration-grouping/pair/{pair_id}`

Agent resolves `registrationPairId` from seeker data before calling this tool.

**Acceptance Criteria:**
- Seeker's `isPaired` becomes false after tool runs
- Tool returns clear error if `pair_id` is not found

---

### [STORY-003-02] Honor Preferred Roommate Requests

| Field | Value |
|---|---|
| **Story ID** | STORY-003-02 |
| **Title** | Implement preferred roommate matching and pairing |
| **As an** | Agent |
| **I want** | to find preferred roommate matches and pair + allocate them |
| **So that** | the admin can say "honor all preferred roommate requests" and it works |
| **Story Points** | 7 |
| **Priority** | Medium |

---

#### [TASK-003-02-01] Implement get_preferred_roommate_matches tool

| Field | Value |
|---|---|
| **Task ID** | TASK-003-02-01 |
| **Title** | Implement get_preferred_roommate_matches tool |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 3 |
| **Priority** | Medium |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §6 — `get_preferred_roommate_matches` |

**Description:**
In `tools/seekers.py`, implement:
`GET /room-allocation/registrations/preferred-roommate?programId=&subProgramId=&seekerId=&name=`

Returns list of seekers whose name matches the preferred roommate string.

---

#### [TASK-003-02-02] Implement honor_all_preferred_roommates orchestration

| Field | Value |
|---|---|
| **Task ID** | TASK-003-02-02 |
| **Title** | Implement full preferred roommate honor flow in agent |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 4 |
| **Priority** | Medium |
| **UAT Required** | Yes |
| **PRD Ref** | PRD Feature 7 |

**Description:**
When admin says "honor all preferred roommate requests", agent must:
1. Fetch all unallocated seekers with non-null `preferredRoomMate`
2. For each, call `get_preferred_roommate_matches`
3. If exactly one unallocated match found: call `create_pair`, then `allocate_seekers_to_room`
4. If multiple matches: pick the one whose gender matches; if still ambiguous, report to admin
5. If match is already allocated: report "match found but already in Room X — want me to move them?"
6. Final report: matched count, unmatched count, conflict details

**Acceptance Criteria:**
- Matched pairs end up in the same room
- No gender rule violation
- All unresolved cases reported clearly

---

---

## EPIC-AGENT-004 — Agent Prompt & Conflict Handling

| Field | Value |
|---|---|
| **Epic ID** | EPIC-AGENT-004 |
| **Title** | Agent Prompt Design & Conflict Handling |
| **Type** | Feature |
| **Description** | Write and tune the system prompt, implement conflict detection, implement the confirmation gate for bulk actions, and test all edge cases from PRD §9. |
| **Platform Scope** | Python |
| **PRD Ref** | PRD §8, §9 |
| **Dependencies** | EPIC-AGENT-002, EPIC-AGENT-003 |

---

### [STORY-004-01] System Prompt & Business Rules

| Field | Value |
|---|---|
| **Story ID** | STORY-004-01 |
| **Title** | Write and tune agent system prompt with all business rules |
| **Story Points** | 5 |
| **Priority** | Critical |

---

#### [TASK-004-01-01] Implement and test system prompt

| Field | Value |
|---|---|
| **Task ID** | TASK-004-01-01 |
| **Title** | Implement system prompt in agent.py |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 3 |
| **Priority** | Critical |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §8 |

**Description:**
Write the system prompt in `agent.py` encoding all rules from BRD §5 and PRD §8. Test that the LLM correctly refuses to violate gender rules, capacity rules, and reserved room rules even when the admin prompt appears to instruct otherwise.

**Acceptance Criteria:**
- Agent refuses gender violation with explanation even if admin says "put everyone in room 101"
- Agent asks for confirmation before acting on >50 seekers
- Agent never acts on a different program's data

---

#### [TASK-004-01-02] Implement bulk confirmation gate

| Field | Value |
|---|---|
| **Task ID** | TASK-004-01-02 |
| **Title** | Implement confirmation step for bulk actions >50 seekers |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | Yes |

**Description:**
Before executing any allocation batch > 50 seekers, the agent must stream:
```
"I'm about to allocate 287 seekers across 43 rooms. Confirm? (yes/no)"
```
And wait for the next user message. If "yes" (or equivalent) → proceed. If "no" → abort and report.

---

### [STORY-004-02] Edge Case & Conflict Handling

| Field | Value |
|---|---|
| **Story ID** | STORY-004-02 |
| **Title** | Handle all conflict and edge case scenarios from PRD §9 |
| **Story Points** | 8 |
| **Priority** | High |

---

#### [TASK-004-02-01] Implement conflict detection and plain-English reporting

| Field | Value |
|---|---|
| **Task ID** | TASK-004-02-01 |
| **Title** | Implement conflict detection and reporting |
| **Task Type** | Development |
| **Platform** | Python |
| **Story Points** | 4 |
| **Priority** | High |
| **UAT Required** | Yes |
| **PRD Ref** | PRD §9 Edge Cases |

**Description:**
Ensure agent correctly handles and reports all cases from PRD §9:
- Seeker already allocated
- Paired seeker whose partner is already allocated to a full room
- No rooms available for seeker's gender
- Name search returns multiple matches
- Backend API error
- Preferred roommate already allocated elsewhere

Each case must produce a plain-English response with next-step suggestion.

---

#### [TASK-004-02-02] End-to-end scenario testing

| Field | Value |
|---|---|
| **Task ID** | TASK-004-02-02 |
| **Title** | Run end-to-end scenario tests against staging NestJS |
| **Task Type** | Testing |
| **Platform** | Python |
| **Story Points** | 4 |
| **Priority** | High |
| **UAT Required** | Yes |

**Test Scenarios:**

| # | Prompt | Expected Outcome |
|---|---|---|
| 1 | "Allocate all unassigned female seekers" | All eligible females allocated, no gender violations |
| 2 | "Pair Arun and Vikram" | Pair created successfully |
| 3 | "Allocate all unassigned seekers from Chennai to floor 2" | Chennai seekers on floor 2 only |
| 4 | "Move Priya to Meena's room" | Priya moved; if paired, both move |
| 5 | "Clear floor 3" | All floor 3 allocations removed |
| 6 | "Honor all preferred roommate requests" | Matched pairs in same room |
| 7 | "Put everyone in room 101" | Agent refuses if gender violation would occur |
| 8 | "Allocate all 300 seekers" | Agent asks for confirmation before proceeding |

---

---

## EPIC-AGENT-005 — Frontend Integration

| Field | Value |
|---|---|
| **Epic ID** | EPIC-AGENT-005 |
| **Title** | Frontend Integration |
| **Type** | Feature |
| **Description** | Add the "Ask AI" button to the room allocation page, wire the existing AIOverlay to the new agent endpoint, handle streaming response display, and trigger page reload after agent completes. |
| **Platform Scope** | React |
| **PRD Ref** | PRD §4 UI Changes |
| **Dependencies** | EPIC-AGENT-001 |

---

### [STORY-005-01] Ask AI Button & Overlay Wiring

| Field | Value |
|---|---|
| **Story ID** | STORY-005-01 |
| **Title** | Add Ask AI button to room allocation page and wire AIOverlay |
| **Story Points** | 8 |
| **Priority** | High |

---

#### [TASK-005-01-01] Add Ask AI button to AllocateRooms page

| Field | Value |
|---|---|
| **Task ID** | TASK-005-01-01 |
| **Title** | Add Ask AI button to AllocateRooms page header |
| **Task Type** | Development |
| **Platform** | React |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | Yes |
| **File** | `src/components/AllocateRooms/index.tsx` |
| **PRD Ref** | PRD §4.1 |

**Description:**
Add an "Ask AI" button to the AllocateRooms page header area. On click, set `isAIOpen = true` to open the AIOverlay drawer. Match the existing AI button style used elsewhere in the app.

**Acceptance Criteria:**
- Button is visible on the room allocation page
- Click opens the AI chat drawer
- Button is disabled while the agent is running (prevents double-open)

---

#### [TASK-005-01-02] Wire AIOverlay to room agent endpoint

| Field | Value |
|---|---|
| **Task ID** | TASK-005-01-02 |
| **Title** | Wire AIOverlay to REACT_APP_ROOM_AGENT_URL |
| **Task Type** | Development |
| **Platform** | React |
| **Story Points** | 2 |
| **Priority** | High |
| **UAT Required** | No |
| **File** | `src/components/AllocateRooms/index.tsx` |
| **PRD Ref** | PRD §4.2 |

**Description:**
Pass the following props to the existing `AIOverlay` component:
```tsx
<AIOverlay
  isOpen={isAIOpen}
  onClose={() => setIsAIOpen(false)}
  apiEndpoint={process.env.REACT_APP_ROOM_AGENT_URL}
  programId={programId}
/>
```

Add `REACT_APP_ROOM_AGENT_URL` to `.env.example`, `.env.development`, and `.env.production`.

---

#### [TASK-005-01-03] Add onAgentComplete reload callback

| Field | Value |
|---|---|
| **Task ID** | TASK-005-01-03 |
| **Title** | Add onAgentComplete prop to AIOverlay and trigger page reload |
| **Task Type** | Development |
| **Platform** | React |
| **Story Points** | 3 |
| **Priority** | High |
| **UAT Required** | Yes |
| **Files** | `src/common/components/AI-overlay/index.tsx`, `src/components/AllocateRooms/index.tsx` |
| **PRD Ref** | PRD §4.3 |

**Description:**
Add optional `onAgentComplete?: () => void` prop to `AIOverlayProps`. When the final SSE event closes (stream ends), call `onAgentComplete()` if provided.

In `AllocateRooms`, pass:
```tsx
onAgentComplete={() => {
  fetchRoomData(true);
  fetchApi(true);
}}
```

**Acceptance Criteria:**
- After agent's last message appears, the room grid and seeker list both reload
- Reload only happens once per agent run (not on every streamed token)
- If agent is closed mid-stream, no reload is triggered

---

### [STORY-005-02] Streaming Display & UX Polish

| Field | Value |
|---|---|
| **Story ID** | STORY-005-02 |
| **Title** | Display streaming tokens correctly in AIOverlay |
| **Story Points** | 6 |
| **Priority** | Medium |

---

#### [TASK-005-02-01] Verify SSE streaming works in existing AIOverlay

| Field | Value |
|---|---|
| **Task ID** | TASK-005-02-01 |
| **Title** | Verify and fix SSE streaming consumption in AIOverlay |
| **Task Type** | Development |
| **Platform** | React |
| **Story Points** | 3 |
| **Priority** | Medium |
| **UAT Required** | Yes |
| **File** | `src/common/components/AI-overlay/index.tsx` |

**Description:**
The existing AIOverlay uses `await response.json()` (line 997) which blocks until the full response. Update `handleSendMessage` to use `ReadableStream` for the room agent endpoint. The streaming path should only activate when `Content-Type: text/event-stream` is returned; existing `response.json()` path stays for the analytics agent endpoint.

**Acceptance Criteria:**
- Agent response tokens appear incrementally in the chat bubble
- First token visible within 2 seconds of sending
- Progress messages ("Allocating 50/200...") display as they arrive

---

#### [TASK-005-02-02] Add loading state and disable input during agent run

| Field | Value |
|---|---|
| **Task ID** | TASK-005-02-02 |
| **Title** | Disable input while room agent is running |
| **Task Type** | Development |
| **Platform** | React |
| **Story Points** | 2 |
| **Priority** | Medium |
| **UAT Required** | Yes |

**Description:**
While the room agent is streaming a response, the input field and send button should be disabled. The existing `isLoading` state already handles this — ensure it stays `true` for the full duration of the stream (not just until first token).

---

#### [TASK-005-02-03] Add environment variable and deployment config

| Field | Value |
|---|---|
| **Task ID** | TASK-005-02-03 |
| **Title** | Add REACT_APP_ROOM_AGENT_URL to all environments |
| **Task Type** | DevOps |
| **Platform** | Config |
| **Story Points** | 1 |
| **Priority** | High |
| **UAT Required** | No |

**Description:**
Add `REACT_APP_ROOM_AGENT_URL` to:
- `.env.example` (with placeholder)
- `.env.development` (local agent service URL)
- `.env.production` (production agent service URL)
- CI/CD pipeline environment variable config (Jenkins/GitHub Actions)

---

## TASK SUMMARY

| Epic | Tasks | Story Points |
|---|---|---|
| EPIC-AGENT-001 Infrastructure | 4 | 8 |
| EPIC-AGENT-002 Allocation Tools | 8 | 26 |
| EPIC-AGENT-003 Pairing Tools | 5 | 19 |
| EPIC-AGENT-004 Prompt & Conflicts | 4 | 13 |
| EPIC-AGENT-005 Frontend | 7 | 13 |
| **Total** | **28** | **79** |

---

## SUGGESTED SPRINT PLAN

| Sprint | Epics | Goal |
|---|---|---|
| Sprint 1 | EPIC-AGENT-001 + EPIC-AGENT-002 | Agent service running, all allocation tools working, testable via curl |
| Sprint 2 | EPIC-AGENT-003 + EPIC-AGENT-004 | Pairing, preferred roommates, conflict handling, system prompt tuned |
| Sprint 3 | EPIC-AGENT-005 | Frontend integrated, end-to-end UAT on staging |
