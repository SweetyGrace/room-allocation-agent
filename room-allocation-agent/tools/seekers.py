import json
from pydantic_ai import RunContext
from models.deps import AgentDeps
from models.seeker import SeekerInfo


async def get_unallocated_seekers(
    ctx: RunContext[AgentDeps],
    gender: str | None = None,
    city: str | None = None,
    search: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
    limit: int = 100,
) -> list[SeekerInfo]:
    """
    Fetch seekers who have not yet been assigned a room for this sub-program.
    Automatically paginates to return ALL matching seekers (not just first page).

    Args:
        gender: "M" or "F" to filter by gender
        city: city name to filter (e.g. "Chennai", "Mumbai")
        search: partial name search
        min_age: only include seekers this age or older (e.g. 40)
        max_age: only include seekers this age or younger (e.g. 60)
        limit: page size per request (max 100)
    """
    all_seekers: list[SeekerInfo] = []
    offset = 0

    while True:
        filters: dict = {
            "allocatedProgramId": [ctx.deps.sub_program_id],
        }
        if gender:
            # NestJS enum stores "Male"/"Female"; send both values to be safe
            api_gender = "Male" if gender == "M" else "Female"
            filters["gender"] = [api_gender]
        if city:
            filters["location"] = [city]

        params: dict = {
            "limit": limit,
            "offset": offset,
            "programId": ctx.deps.program_id,
        }
        if filters:
            params["filters"] = json.dumps(filters)

        resp = await ctx.deps.http_client.get(
            f"{ctx.deps.nest_base_url}/room-allocation/registrations",
            params=params,
            headers={"Authorization": ctx.deps.auth_header},
        )
        resp.raise_for_status()
        body = resp.json()
        raw_data = body.get("data") or {}
        # Support both {data: {data: [...]}} and {data: [...]} shapes
        if isinstance(raw_data, dict):
            page_data = raw_data.get("data") or []
            print(f"[seekers] offset={offset} total={raw_data.get('total')} page_count={len(page_data)}")
        else:
            page_data = raw_data
            print(f"[seekers] offset={offset} page_count={len(page_data)}")

        if page_data and len(page_data) > 0:
            first = page_data[0]
            print(f"[seekers] first item keys: {list(first.keys())}")
            print(f"[seekers] first item fullName={first.get('fullName')} gender={first.get('gender')} id={first.get('id')}")
            import json as _json
            print(f"[seekers] first item pairCode={first.get('pairCode')} pairId={first.get('pairId')} registrationPairId={first.get('registrationPairId')}")
            if first.get('registrationPairMaps'):
                print(f"[seekers] first item registrationPairMaps={_json.dumps(first.get('registrationPairMaps'), default=str)}")

        if not page_data:
            break

        for raw in page_data:
            try:
                all_seekers.append(SeekerInfo.from_api(raw))
            except Exception as e:
                print(f"[seekers] parse error: {e} raw={raw}")
                pass

        # Stop if we got fewer records than requested (last page)
        if len(page_data) < limit:
            break

        offset += limit

    # Python-side gender filter — guarantees correctness regardless of API filter behaviour
    if gender:
        all_seekers = [s for s in all_seekers if s.gender == gender]

    # Python-side city filter — case-insensitive substring match
    if city:
        city_lower = city.lower()
        all_seekers = [s for s in all_seekers if s.city and city_lower in s.city.lower()]

    # Python-side age filters
    if min_age is not None:
        all_seekers = [s for s in all_seekers if s.age is not None and s.age >= min_age]
    if max_age is not None:
        all_seekers = [s for s in all_seekers if s.age is not None and s.age <= max_age]

    # Case-insensitive partial name match in Python — more reliable than API search
    if search:
        search_lower = search.lower()
        all_seekers = [s for s in all_seekers if search_lower in s.name.lower()]

    return all_seekers


async def search_all_seekers(
    ctx: RunContext[AgentDeps],
    search: str,
    gender: str | None = None,
) -> list[SeekerInfo]:
    """
    Search for seekers by partial name across ALL seekers — both unallocated
    and already allocated to rooms. Returns merged, deduplicated results.

    Args:
        search: partial name to search (case-insensitive)
        gender: "M" or "F" to narrow results
    """
    from tools.rooms import get_all_rooms

    search_lower = search.lower()
    results: dict[int, SeekerInfo] = {}  # keyed by seeker id to deduplicate

    # 1. Search unallocated seekers
    unallocated = await get_unallocated_seekers(ctx, gender=gender, search=search)
    for s in unallocated:
        results[s.id] = s

    # 2. Search allocated seekers via room occupants
    rooms = await get_all_rooms(ctx)
    for room in rooms:
        for occupant in room.occupants:
            if occupant.id is None:
                continue
            if occupant.id in results:
                continue
            if gender and occupant.gender != gender:
                continue
            if search_lower not in occupant.name.lower():
                continue
            results[occupant.id] = occupant

    return list(results.values())


async def get_preferred_roommate_matches(
    ctx: RunContext[AgentDeps],
    seeker_id: int,
    preferred_name: str,
) -> list[SeekerInfo]:
    """
    Find unallocated seekers whose name matches the preferred roommate string
    for a given seeker.

    Args:
        seeker_id: programRegistrationId of the seeker making the preference
        preferred_name: the name string the seeker entered as preferred roommate
    """
    resp = await ctx.deps.http_client.get(
        f"{ctx.deps.nest_base_url}/room-allocation/registrations/preferred-roommate",
        params={
            "programId": ctx.deps.program_id,
            "subProgramId": ctx.deps.sub_program_id,
            "seekerId": seeker_id,
            "name": preferred_name,
        },
        headers={"Authorization": ctx.deps.auth_header},
    )
    resp.raise_for_status()
    body = resp.json()
    raw_data = body.get("data") or []
    matches = raw_data.get("data") if isinstance(raw_data, dict) else raw_data

    result = []
    for raw in (matches or []):
        try:
            result.append(SeekerInfo.from_api(raw))
        except Exception:
            pass
    return result
