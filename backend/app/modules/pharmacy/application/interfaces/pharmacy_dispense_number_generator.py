from abc import ABC, abstractmethod


class PharmacyDispenseNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
