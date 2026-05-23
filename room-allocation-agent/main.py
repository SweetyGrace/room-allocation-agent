import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import NEST_BASE_URL, CORS_ORIGIN
from models.deps import AgentDeps
from agent import room_agent

app = FastAPI(title="Room Allocation Agent", version="1.0.0")

# In-memory conversation history store.
# Key: session_id (string from client), Value: list of PydanticAI messages.
# Capped at MAX_HISTORY_MESSAGES per session to avoid unbounded growth.
_sessions: dict[str, list] = {}
MAX_HISTORY_MESSAGES = 40  # ~20 turns (each turn = user + assistant messages)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class AgentRequest(BaseModel):
    prompt: str
    program_id: int
    sub_program_id: int
    auth_token: str
    session_id: str = ""   # Client-generated UUID; empty = stateless (no history)


@app.post("/agent/room-allocation/query")
async def run_room_agent(req: AgentRequest):
    if not req.auth_token or req.auth_token.strip() == "":
        raise HTTPException(status_code=401, detail="auth_token is required")

    async def event_stream():
        async with httpx.AsyncClient(timeout=120.0) as client:
            deps = AgentDeps(
                nest_base_url=NEST_BASE_URL,
                auth_token=req.auth_token,
                program_id=req.program_id,
                sub_program_id=req.sub_program_id,
                http_client=client,
            )
            try:
                history = _sessions.get(req.session_id, []) if req.session_id else []
                result = await room_agent.run(
                    req.prompt,
                    deps=deps,
                    message_history=history,
                )
                # Save updated history for this session
                if req.session_id:
                    all_msgs = result.all_messages()
                    _sessions[req.session_id] = all_msgs[-MAX_HISTORY_MESSAGES:]

                text = result.output if hasattr(result, "output") else str(result.data)
                # Escape newlines so the whole response stays on one SSE data: line.
                # The client decodes \\n back to \n before rendering.
                yield f"data: {text.replace(chr(10), '\\n')}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: Sorry, something went wrong: {str(e)}\n\n"
                yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.delete("/agent/room-allocation/session/{session_id}")
async def clear_session(session_id: str):
    """Clear conversation history for a session (called when the overlay closes)."""
    _sessions.pop(session_id, None)
    return {"cleared": session_id}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "room-allocation-agent"}


class DebugRequest(BaseModel):
    program_id: int
    sub_program_id: int
    auth_token: str
    limit: int = 20
    offset: int = 0


@app.post("/debug/seekers")
async def debug_seekers(req: DebugRequest):
    """Debug endpoint: returns raw NestJS response for unallocated seekers."""
    import json as _json
    async with httpx.AsyncClient(timeout=30.0) as client:
        auth_header = f"Bearer {req.auth_token} custom"
        filters = {"allocatedProgramId": [req.sub_program_id]}
        params = {
            "limit": req.limit,
            "offset": req.offset,
            "programId": req.program_id,
            "filters": _json.dumps(filters),
        }
        resp = await client.get(
            f"{NEST_BASE_URL}/room-allocation/registrations",
            params=params,
            headers={"Authorization": auth_header},
        )
        return {
            "status_code": resp.status_code,
            "url": str(resp.url),
            "body": resp.json() if resp.status_code == 200 else resp.text,
        }


@app.post("/debug/pairs")
async def debug_pairs(req: DebugRequest):
    """
    Shows what pair data our Python parser extracts from each unallocated seeker.
    Grouped as: paired (both unallocated), solo-paired (partner already allocated), unpaired.
    """
    from tools.seekers import get_unallocated_seekers

    async with httpx.AsyncClient(timeout=60.0) as client:
        deps = AgentDeps(
            nest_base_url=NEST_BASE_URL,
            auth_token=req.auth_token,
            program_id=req.program_id,
            sub_program_id=req.sub_program_id,
            http_client=client,
        )

        class FakeCtx:
            def __init__(self, d):
                self.deps = d

        seekers = await get_unallocated_seekers(FakeCtx(deps))

        seen: set = set()
        paired_both: list = []
        solo_paired: list = []
        unpaired_list: list = []

        for s in seekers:
            if s.is_paired and s.pair_code is not None:
                if s.pair_code not in seen:
                    seen.add(s.pair_code)
                    partner = next(
                        (o for o in seekers if o.pair_code == s.pair_code and o.id != s.id),
                        None,
                    )
                    if partner:
                        paired_both.append({
                            "a": s.name, "a_id": s.id,
                            "b": partner.name, "b_id": partner.id,
                            "pair_code": s.pair_code,
                            "reg_pair_id": s.registration_pair_id,
                        })
                    else:
                        solo_paired.append({
                            "name": s.name, "id": s.id,
                            "pair_code": s.pair_code,
                            "reg_pair_id": s.registration_pair_id,
                        })
            elif not s.is_paired:
                unpaired_list.append({"name": s.name, "id": s.id})

        return {
            "total_unallocated": len(seekers),
            "summary": {
                "paired_groups_both_unallocated": len(paired_both),
                "solo_paired_partner_already_allocated": len(solo_paired),
                "unpaired": len(unpaired_list),
            },
            "paired_groups": paired_both,
            "solo_paired": solo_paired,
            "unpaired_names": [u["name"] for u in unpaired_list],
        }
