from typing import Protocol


class AppointmentNumberGenerator(Protocol):
    async def generate(self) -> str: ...
