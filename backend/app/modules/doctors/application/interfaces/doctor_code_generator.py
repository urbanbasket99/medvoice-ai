"""Port for generating a doctor's unique Doctor Code.

Kept behind a `Protocol` (like `UhidGenerator`/`MrnGenerator` in the
Patients module) so `CreateDoctorUseCase` never depends on how doctor
codes are actually produced (currently a Postgres sequence).
"""

from typing import Protocol


class DoctorCodeGenerator(Protocol):
    async def generate(self) -> str: ...
