from abc import ABC, abstractmethod


class AdmissionNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str: ...
