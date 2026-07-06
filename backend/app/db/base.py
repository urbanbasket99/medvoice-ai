"""SQLAlchemy declarative base shared by every ORM model.

A fixed naming convention is applied so that Alembic's `--autogenerate`
produces deterministic, diff-friendly constraint names across environments
instead of dialect-generated ones (e.g. `ix_users_email` instead of a
random hash).
"""

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for all ORM models in the application."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)
