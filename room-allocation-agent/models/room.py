from pydantic import BaseModel
from .seeker import SeekerInfo


class RoomInfo(BaseModel):
    """
    Represents one room from the room inventory.
    Maps to GET /room-inventory response shape.
    """
    room_inventory_id: int
    room_id: str                     # human-readable room number e.g. "101"
    floor: str                       # e.g. "Ground Floor"
    block: str | None = None         # e.g. "Alankritha - Block"
    venue: str | None = None
    capacity: int
    remaining_occupancy: int
    is_reserved: bool = False
    room_status: str = ""
    reserved_for: str | None = None
    occupants: list[SeekerInfo] = []

    @property
    def is_full(self) -> bool:
        return self.remaining_occupancy <= 0

    @property
    def is_available(self) -> bool:
        return not self.is_full and not self.is_reserved

    @classmethod
    def from_api(cls, raw: dict) -> "RoomInfo":
        """Map NestJS /room-inventory item → RoomInfo."""
        room = raw.get("room", {})
        floor_obj = room.get("floor", {})
        block_obj = floor_obj.get("block", {}) if floor_obj else {}
        venue_obj = block_obj.get("venue", {}) if block_obj else {}

        allocations = raw.get("roomAllocations", []) or []
        occupants = []
        for i, alloc in enumerate(allocations):
            reg = alloc.get("registration")
            if reg:
                if i == 0:
                    import json as _json
                    print(f"[room.py DEBUG] reg keys: {list(reg.keys())}")
                    print(f"[room.py DEBUG] registrationPairMaps: {_json.dumps(reg.get('registrationPairMaps'), default=str)}")
                    print(f"[room.py DEBUG] pairCode: {reg.get('pairCode')} registrationPairId: {reg.get('registrationPairId')}")
                try:
                    # Inject the roomAllocation id so unallocate tools can use it
                    reg_with_alloc_id = {**reg, "roomAllocationId": alloc.get("id")}
                    occupants.append(SeekerInfo.from_api(reg_with_alloc_id))
                except Exception:
                    pass

        return cls(
            room_inventory_id=raw.get("id"),
            room_id=room.get("roomNumber", str(raw.get("id", ""))),
            floor=floor_obj.get("label", ""),
            block=block_obj.get("label"),
            venue=venue_obj.get("label"),
            capacity=room.get("occupancy", 0),
            remaining_occupancy=raw.get("remainingOccupancy", 0),
            is_reserved=raw.get("isReserved", False),
            room_status=raw.get("roomStatus", ""),
            reserved_for=raw.get("reservedFor"),
            occupants=occupants,
        )
