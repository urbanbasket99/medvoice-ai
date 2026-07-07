from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MedicineMasterModel(Base):
    __tablename__ = "medicine_master"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    generic_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    strength: Mapped[str | None] = mapped_column(String(50), nullable=True)
    form: Mapped[str | None] = mapped_column(String(50), nullable=True)
    default_route: Mapped[str | None] = mapped_column(String(20), nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String(200), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
