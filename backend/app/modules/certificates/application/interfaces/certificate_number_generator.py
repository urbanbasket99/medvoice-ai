from abc import ABC, abstractmethod


class CertificateNumberGenerator(ABC):
    @abstractmethod
    async def generate(self) -> str: ...
