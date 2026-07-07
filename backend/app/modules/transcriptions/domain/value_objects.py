from enum import StrEnum


class TranscriptionStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TranscriptionSortField(StrEnum):
    CREATED_AT = "created_at"
    STATUS = "status"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"
