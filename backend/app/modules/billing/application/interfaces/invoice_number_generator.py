from abc import ABC, abstractmethod


class InvoiceNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
