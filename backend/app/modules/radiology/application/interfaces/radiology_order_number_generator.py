from abc import ABC, abstractmethod


class RadiologyOrderNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
