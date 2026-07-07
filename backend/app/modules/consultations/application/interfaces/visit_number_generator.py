from abc import ABC, abstractmethod


class VisitNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
