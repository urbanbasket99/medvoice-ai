"""Port for generating a patient's Medical Record Number (MRN).

Kept as its own protocol (rather than a second method on `UhidGenerator`)
because the two identifiers serve different purposes and may evolve
independently — UHID is the hospital-wide unique id used across future
modules (billing, laboratory, ...), MRN is the classic sequential medical
record number clinicians reference on paper charts.
"""

from typing import Protocol


class MrnGenerator(Protocol):
    async def generate(self) -> str: ...
