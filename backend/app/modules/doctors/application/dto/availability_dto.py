from dataclasses import dataclass
from datetime import time


@dataclass(frozen=True, slots=True)
class AvailabilitySlotInput:
    day_of_week: int
    start_time: time
    end_time: time
    slot_minutes: int = 30
    is_active: bool = True


@dataclass(frozen=True, slots=True)
class ReplaceAvailabilityInput:
    slots: tuple[AvailabilitySlotInput, ...]
