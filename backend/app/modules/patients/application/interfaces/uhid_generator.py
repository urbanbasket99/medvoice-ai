from typing import Protocol


class UhidGenerator(Protocol):
    """Generates a globally unique Unique Health ID for a new patient.

    Kept behind a `Protocol` (like `PasswordHasher`/`TokenService` in the
    Authentication module) so `CreatePatientUseCase` never depends on how
    UHIDs are actually produced (currently a Postgres sequence).
    """

    async def generate(self) -> str: ...
