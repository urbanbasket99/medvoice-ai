"""Pure many-to-many association tables (no extra columns, so plain
`Table` objects rather than mapped classes — this is the idiomatic
SQLAlchemy 2.0 approach for simple join tables).
"""

from sqlalchemy import Column, ForeignKey, Table, Uuid

from app.db.base import Base

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Uuid, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Uuid, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Uuid, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "permission_id",
        Uuid,
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

__all__ = ["role_permissions", "user_roles"]
