from abc import ABC, abstractmethod


class LabOrderNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
