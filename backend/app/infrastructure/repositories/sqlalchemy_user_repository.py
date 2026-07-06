from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.models.user import UserModel
from app.infrastructure.repositories.mappers import user_to_entity


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: UUID) -> User | None:
        result = await self._session.execute(select(UserModel).where(UserModel.id == user_id))
        model = result.scalar_one_or_none()
        return user_to_entity(model) if model else None

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.email == email.lower())
        )
        model = result.scalar_one_or_none()
        return user_to_entity(model) if model else None

    async def exists_by_email(self, email: str) -> bool:
        result = await self._session.execute(
            select(UserModel.id).where(UserModel.email == email.lower())
        )
        return result.scalar_one_or_none() is not None

    async def update_password(self, user_id: UUID, hashed_password: str) -> None:
        await self._session.execute(
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(hashed_password=hashed_password)
        )
