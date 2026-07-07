from abc import ABC, abstractmethod


class PaymentNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
