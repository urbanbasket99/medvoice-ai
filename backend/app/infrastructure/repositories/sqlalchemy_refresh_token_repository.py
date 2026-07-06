from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.refresh_token import RefreshToken
from app.domain.repositories.refresh_token_repository import RefreshTokenRepository
from app.infrastructure.models.refresh_token import RefreshTokenModel
from app.infrastructure.repositories.mappers import refresh_token_to_entity


class SqlAlchemyRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, refresh_token: RefreshToken) -> RefreshToken:
        model = RefreshTokenModel(
            id=refresh_token.id,
            user_id=refresh_token.user_id,
            token_hash=refresh_token.token_hash,
            expires_at=refresh_token.expires_at,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return refresh_token_to_entity(model)

    async def get_by_token_hash(self, token_hash: str) -> RefreshToken | None:
        result = await self._session.execute(
            select(RefreshTokenModel).where(RefreshTokenModel.token_hash == token_hash)
        )
        model = result.scalar_one_or_none()
        return refresh_token_to_entity(model) if model else None

    async def revoke(self, token_id: UUID, replaced_by_token_id: UUID | None = None) -> None:
        await self._session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.id == token_id)
            .values(revoked_at=datetime.now(UTC), replaced_by_token_id=replaced_by_token_id)
        )

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        await self._session.execute(
            update(RefreshTokenModel)
            .where(RefreshTokenModel.user_id == user_id)
            .where(RefreshTokenModel.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )
