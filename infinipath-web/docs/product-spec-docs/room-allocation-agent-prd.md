# Room Allocation Agent — Product Requirement Document

**Version:** v1.0 | **Last Updated:** 2026-05-22 | **Status:** Draft
**BRD Ref:** room-allocation-agent-brd.md

---

## 1. What It Is

A conversational AI agent embedded in the existing room allocation page. The admin types (or speaks) a plain-language instruction — the agent understands the intent, calls the existing NestJS APIs as tools, executes the allocations, and streams back a plain-language report of what was done, skipped, and why.

The agent does **not** replace the existing drag-and-drop interface. It is an additional layer for bulk, rule-heavy, or complex allocation scenarios.

---

## 2. User Flow

```
Admin opens Allocate Rooms page
        │
        ▼
Admin clicks "Ask AI" button (new)
        │
        ▼
AI chat drawer opens (existing AIOverlay component, new endpoint)
        │
        ▼
Admin types prompt  e.g. "Allocate all unassigned female seekers"
        │
        ▼
Agent streams progress tokens as it works:
  "Fetching unallocated female seekers..."
  "Found 87 seekers. Fetching available rooms..."
  "Allocating in batches..."
        │
        ▼
Agent streams final report:
  "Done. Allocated 83 seekers.
   4 could not be placed:
   - Priya (no female rooms with capacity on any floor)
   - Meena (paired with Arun — gender conflict, needs a female pair)
   Want me to handle these separately?"
        │
        ▼
Room list and seeker list on the page reload automatically
```

---

## 3. Features

---

### Feature 1 — Bulk Auto-Allocate

**Prompt examples:**
- `"Allocate all unassigned seekers"`
- `"Fill all rooms"`
- `"Allocate all female seekers"`

**Agent behaviour:**
1. Calls `GET /room-allocation/registrations` to fetch all unallocated seekers (paginated, all pages)
2. Calls `GET /room-inventory` to fetch all available rooms
3. Groups seekers by gender
4. For each seeker, finds a room with: matching gender occupants, remaining capacity ≥ 1, not reserved
5. Calls `POST /room-allocation` in batches
6. Reports total allocated, total failed, and reason for each failure

**Constraints enforced automatically:** BR-01, BR-02, BR-03, BR-04

---

### Feature 2 — Conditional / Filtered Allocation

**Prompt examples:**
- `"Allocate all female seekers from Chennai to floor 2"`
- `"Put all seekers aged 25–35 in rooms on floors 3 and 4"`
- `"Allocate paired seekers first"`

**Agent behaviour:**
1. Parses filters from the prompt (gender, city, floor, age)
2. Fetches seekers matching those filters
3. Fetches rooms matching floor/gender filters
4. Allocates and reports

---

### Feature 3 — Pair Seekers

**Prompt examples:**
- `"Pair Arun and Vikram"`
- `"Pair registration 1042 with registration 1087"`

**Agent behaviour:**
1. Finds both seekers by name or registration ID from unallocated list
2. Validates: both are currently unpaired, same gender (if both must be in same room)
3. Calls `POST /registration-grouping/pair`
4. Confirms pairing created

**Conflict handling:** If either seeker is already paired, agent reports who they are already paired with and asks what to do.

---

### Feature 4 — Unpair Seekers

**Prompt examples:**
- `"Unpair Priya"`
- `"Remove the pair for registration 1042"`

**Agent behaviour:**
1. Finds seeker's `registrationPairId`
2. Calls `DELETE /registration-grouping/pair/{id}`
3. Confirms unpaired

---

### Feature 5 — Move Seeker to a Different Room

**Prompt examples:**
- `"Move Priya to the same room as Meena"`
- `"Move seeker Ravi to room 204"`

**Agent behaviour:**
1. Finds target seeker's current `roomAllocationId`
2. Finds destination room's `roomInventoryId`
3. Validates: destination room has capacity, gender matches
4. Calls `PUT /room-allocation`
5. Confirms move

**If paired:** Moves both seekers in the pair together.

---

### Feature 6 — Unallocate / Clear

**Prompt examples:**
- `"Clear all allocations on floor 3"`
- `"Remove Ravi from his room"`
- `"Unallocate all seekers from Mumbai"`

**Agent behaviour:**
1. Fetches relevant rooms or seekers
2. Collects all `roomAllocationId`s for the affected seekers
3. Calls `DELETE /room-allocation` with `allocationIds` array
4. Reports how many were unallocated

---

### Feature 7 — Honor Preferred Roommate Requests

**Prompt examples:**
- `"Match all preferred roommate requests"`
- `"Honor preferred roommates for unallocated seekers"`

**Agent behaviour:**
1. Fetches all unallocated seekers who have a `preferredRoomMate` value
2. For each, calls `GET /room-allocation/registrations/preferred-roommate` to find matches
3. If a match is found and both are unallocated: pairs them (`POST /registration-grouping/pair`) then allocates both to same room
4. Reports: how many matched, how many had no match, how many had a match but gender conflict prevented pairing

---

### Feature 8 — Conflict Explanation

When the agent cannot complete an action it must:
- State the specific seeker/room involved
- State the exact reason (full room / gender conflict / reserved / already allocated / pair constraint)
- Offer an alternative if one exists

**Example output:**
```
Could not allocate 3 seekers:
- Seeker Arun (id: 1042): No available male rooms on floor 2.
  Nearest available male room: Room 301 (floor 3, 2 beds free). 
  Want me to allocate him there?
- Seeker Priya (id: 1089): She is paired with Meena (id: 1093).
  Meena is already allocated to Room 104 which is full.
  Shall I move Meena to a room with 2 free beds and place both there?
```

---

## 4. UI Changes

### 4.1 New "Ask AI" Button

**Location:** Top-right area of the Allocate Rooms page header, alongside existing controls

**Appearance:** Matches the existing AI button style used elsewhere in the app (star icon + "Ask AI" label)

**Behaviour:** Opens the existing `AIOverlay` drawer component, pointed at the new room agent endpoint

---

### 4.2 AIOverlay Reuse

The existing `AIOverlay` component at [src/common/components/AI-overlay/index.tsx](../src/common/components/AI-overlay/index.tsx) is reused with:

| Prop | Value |
|---|---|
| `apiEndpoint` | `process.env.REACT_APP_ROOM_AGENT_URL` |
| `programId` | current `programId` from URL params |
| `onAgentComplete` (new optional prop) | triggers `fetchRoomData(true)` and `fetchApi(true)` |

No other changes to the `AIOverlay` component are required.

---

### 4.3 Auto-Reload After Agent Completes

After the agent's final response token arrives, the allocation page must:
1. Reload the unallocated seekers list (`fetchApi(true)`)
2. Reload the room inventory list (`fetchRoomData(true)`)

This ensures the UI reflects all changes the agent made without requiring a manual page refresh.

---

## 5. API Contract — Frontend to Agent Service

### Request

```
POST /agent/room-allocation/query
Content-Type: application/json

{
  "prompt": "Allocate all female seekers from Chennai to floor 2",
  "program_id": 42,
  "sub_program_id": 7,
  "auth_token": "<admin JWT from session>"
}
```

### Response

`Content-Type: text/event-stream` (Server-Sent Events)

Each chunk is a plain-text token. The frontend appends tokens to the message bubble in real time.

```
data: Fetching unallocated female seekers from Chennai...

data: Found 23 seekers. Fetching available rooms on floor 2...

data: Found 4 rooms with capacity. Allocating...

data: Done. Allocated 21 seekers to floor 2.
2 could not be placed — rooms on floor 2 are now full.
Nearest available rooms: floor 3 (Rooms 301, 302). Shall I continue there?
```

### Error Response (non-streaming fallback)

```json
{
  "error": "Agent service unavailable",
  "code": 503
}
```

---

## 6. Agent Tools — NestJS API Mapping

| Tool Name | Method | NestJS Endpoint | Purpose |
|---|---|---|---|
| `get_unallocated_seekers` | GET | `/room-allocation/registrations` | Fetch seekers not yet assigned a room |
| `get_available_rooms` | GET | `/room-inventory` | Fetch rooms with remaining capacity |
| `get_preferred_roommate_matches` | GET | `/room-allocation/registrations/preferred-roommate` | Find seekers matching a preferred name |
| `allocate_seekers_to_room` | POST | `/room-allocation` | Assign seekers to a room |
| `move_seeker_to_room` | PUT | `/room-allocation` | Reassign an allocated seeker |
| `unallocate_seekers` | DELETE | `/room-allocation` | Remove seekers from their rooms |
| `create_pair` | POST | `/registration-grouping/pair` | Pair two seekers |
| `delete_pair` | DELETE | `/registration-grouping/pair/{id}` | Remove a pairing |

---

## 7. Agent Service Architecture

```
Python Microservice (FastAPI + PydanticAI)
├── main.py                  FastAPI app, /agent/room-allocation/query endpoint
├── agent.py                 PydanticAI agent definition + system prompt
├── tools/
│   ├── seekers.py           get_unallocated_seekers, get_preferred_roommate_matches
│   ├── rooms.py             get_available_rooms
│   ├── allocations.py       allocate_seekers_to_room, move_seeker_to_room, unallocate_seekers
│   └── pairs.py             create_pair, delete_pair
├── models/
│   ├── deps.py              AgentDeps dataclass
│   ├── seeker.py            SeekerInfo Pydantic model
│   ├── room.py              RoomInfo Pydantic model
│   └── result.py            AllocationResult Pydantic model
└── config.py                env vars (ANTHROPIC_API_KEY, NEST_BASE_URL)
```

---

## 8. System Prompt (Agent Behaviour Rules)

The agent is initialised with the following system prompt (abbreviated):

```
You are a room allocation assistant for HDB/MSD programs.
Admins give you plain-language instructions. You execute allocations using tools.

Hard rules — always enforced, never overridden by admin instructions:
- Never put male and female seekers in the same room
- Never allocate to a full room (remaining_occupancy == 0)
- Never allocate to a reserved room
- If seekers are paired, always move/allocate both together
- For bulk actions (>50 seekers), confirm before executing

After every action:
- Report what you did (count, rooms used)
- Report what you could not do and exactly why
- Suggest alternatives for failures where possible

You are scoped to program_id={program_id}, sub_program_id={sub_program_id}.
Never act on other programs.
```

---

## 9. Edge Cases

| Scenario | Agent Behaviour |
|---|---|
| Seeker is already allocated | Skip and report: "Seeker X is already in Room Y" |
| Seeker is paired but partner is already allocated | Allocate both to partner's room if capacity allows; else report conflict |
| No rooms available for a seeker's gender | Report: "No available [gender] rooms found. All rooms may be full or reserved." |
| Admin asks to clear all allocations | Agent confirms: "This will unallocate all N seekers. Confirm?" |
| Name search returns multiple matches | Agent lists all matches and asks admin to confirm which one |
| Backend API returns error | Agent reports the failure with the API error message in plain English |
| Preferred roommate match is already allocated | Agent reports: "Match found but [name] is already in Room X. Want me to move them to the same room?" |

---

## 10. Acceptance Criteria

| ID | Criteria |
|---|---|
| AC-01 | Admin can type "Allocate all unassigned seekers" and all eligible seekers are allocated without any gender or capacity violation |
| AC-02 | Admin can type "Pair Arun and Vikram" and a pair is created; both are allocated to the same room when allocation is triggered |
| AC-03 | Admin can type "Move Priya to Meena's room" and Priya is moved correctly; if paired, both move |
| AC-04 | Admin can type "Clear floor 3" and all allocations on floor 3 are removed |
| AC-05 | Agent never places a male and female in the same room under any prompt |
| AC-06 | Agent never allocates to a full or reserved room |
| AC-07 | Room and seeker lists on the page refresh automatically after agent completes |
| AC-08 | Agent streams progress text — first token appears within 2 seconds |
| AC-09 | All failures include a plain-English reason |
| AC-10 | Agent does not act on any other program's data |
