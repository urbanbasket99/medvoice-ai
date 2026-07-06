from uuid import UUID, uuid4

from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.infrastructure.models.associations import role_permissions, user_roles
from app.infrastructure.models.permission import PermissionModel


class RoleModel(Base):
    __tablename__ = "roles"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    permissions: Mapped[list[PermissionModel]] = relationship(
        secondary=role_permissions,
        back_populates="roles",
        lazy="selectin",
    )
    users: Mapped[list["UserModel"]] = relationship(  # noqa: F821
        secondary=user_roles,
        back_populates="roles",
    )
