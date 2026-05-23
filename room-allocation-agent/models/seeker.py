from pydantic import BaseModel


class SeekerInfo(BaseModel):
    """
    Represents one seeker (program registrant) returned from NestJS.
    Maps to the response shape of GET /room-allocation/registrations.
    """
    id: int                              # programRegistrationId
    name: str
    gender: str                          # "M" or "F"
    city: str | None = None
    age: int | None = None
    is_paired: bool = False
    pair_code: int | None = None
    registration_pair_id: int | None = None   # used for DELETE /registration-grouping/pair/{id}
    preferred_room_mate: str | None = None
    room_allocation_id: int | None = None     # None = not yet allocated

    @classmethod
    def from_api(cls, raw: dict) -> "SeekerInfo":
        """
        Map NestJS response fields → SeekerInfo.
        Handles both flat format (room-allocation/registrations)
        and nested format (room-inventory roomAllocations).
        """
        # Flat format: fullName, gender, dob, city at top level
        # Nested format: user.fullName, user.userDetail.gender, etc.
        user = raw.get("user") or {}
        user_detail = user.get("userDetail") or {}
        address = (user.get("userAddress") or {}).get("address") or {}

        # Name: flat wins, fall back to nested
        name = (
            raw.get("fullName")
            or user.get("fullName")
            or ""
        )

        # Gender: flat wins, fall back to nested
        raw_gender = (
            raw.get("gender")
            or user_detail.get("gender")
            or ""
        )
        gender = "M" if str(raw_gender).lower() == "male" else "F"

        # City: flat wins, fall back to nested
        city = (
            raw.get("otherCityName") if raw.get("city") == "Other"
            else raw.get("city")
            or address.get("city")
        )

        # DOB: flat wins, fall back to nested
        dob = raw.get("dob") or user_detail.get("dob") or ""
        age = None
        if dob:
            from datetime import date
            try:
                birth = date.fromisoformat(str(dob)[:10])
                age = (date.today() - birth).days // 365
            except ValueError:
                pass

        # Flat format fields (registrations endpoint)
        # pairCode is often null; registrationPairId is the reliable pair group key
        # (both members of a pair share the same registrationPairId)
        pair_code = raw.get("pairCode") or raw.get("pairId") or raw.get("registrationPairId")
        registration_pair_id = raw.get("registrationPairId") or raw.get("pairId")

        # Nested format uses registrationPairMaps array (room-inventory endpoint)
        # Structure: registrationPairMaps[0].registrationPair.id = pair ID for DELETE
        if pair_code is None:
            pair_maps = raw.get("registrationPairMaps") or []
            if pair_maps:
                registration_pair = pair_maps[0].get("registrationPair") or {}
                pair_code = (
                    pair_maps[0].get("pairCode")
                    or registration_pair.get("pairCode")
                    or registration_pair.get("id")
                    or pair_maps[0].get("id")
                )
                registration_pair_id = registration_pair.get("id") or pair_maps[0].get("id")

        is_paired = pair_code is not None

        return cls(
            id=raw.get("id") or raw.get("programRegistrationId"),
            name=name,
            gender=gender,
            city=city,
            age=age,
            is_paired=is_paired,
            pair_code=pair_code,
            registration_pair_id=registration_pair_id,
            preferred_room_mate=raw.get("preferredRoomMate"),
            room_allocation_id=raw.get("roomAllocationId"),
        )
