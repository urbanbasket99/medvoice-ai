from dataclasses import dataclass
from datetime import datetime, time
from uuid import UUID


@dataclass(slots=True)
class DoctorAvailabilitySlot:
    id: UUID
    doctor_id: UUID
    day_of_week: int  # 0=Mon .. 6=Sun
    start_time: time
    end_time: time
    slot_minutes: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
