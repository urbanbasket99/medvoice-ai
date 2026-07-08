from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Uuid, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RecentSearchModel(Base):
    __tablename__ = "recent_searches"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    query: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class RecentSearchStore:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_recent(self, user_id: UUID, limit: int = 10) -> list[str]:
        stmt = (
            select(RecentSearchModel.query)
            .where(RecentSearchModel.user_id == user_id)
            .order_by(RecentSearchModel.updated_at.desc())
            .limit(limit)
        )
        rows = (await self._session.execute(stmt)).scalars().all()
        return list(rows)

    async def save_recent(self, user_id: UUID, query: str) -> None:
        normalized = query.strip()
        if len(normalized) < 2:
            return

        existing = await self._session.execute(
            select(RecentSearchModel).where(
                RecentSearchModel.user_id == user_id,
                RecentSearchModel.query == normalized,
            )
        )
        model = existing.scalar_one_or_none()
        now = datetime.now(UTC)
        if model:
            model.updated_at = now
        else:
            self._session.add(
                RecentSearchModel(id=uuid4(), user_id=user_id, query=normalized, created_at=now, updated_at=now)
            )
        await self._session.flush()
