from abc import ABC, abstractmethod


class VendorPaymentNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str:
        raise NotImplementedError
