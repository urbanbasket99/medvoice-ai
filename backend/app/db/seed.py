"""Idempotent bootstrap seed for the Authentication module.

Creates, only if missing:
  - the RBAC permission catalog owned by the Authentication/user-management
    bounded context,
  - the "Administrator" role, granted every permission in that catalog,
  - a default admin user, assigned the Administrator role.

Safe to run any number of times:
  - permissions are inserted with `ON CONFLICT DO NOTHING` on `code`,
  - the role→permission grants are inserted directly into the
    `role_permissions` association table with `ON CONFLICT DO NOTHING` on
    `(role_id, permission_id)` — re-running never duplicates a grant and
    never revokes one added some other way,
  - the admin user is fetched-or-created by `email`; if it already exists
    its password is left untouched (re-running never resets a real admin's
    changed password), and the user→role assignment is inserted into
    `user_roles` with `ON CONFLICT DO NOTHING` on `(user_id, role_id)`.

Async-safety note: this script deliberately never reads or mutates the
`RoleModel.permissions` / `UserModel.roles` / `PermissionModel.roles` /
`RoleModel.users` ORM relationship attributes. `RoleModel.permissions` and
`UserModel.roles` are `lazy="selectin"` (safe under `AsyncSession`), but
their *reverse* sides — `PermissionModel.roles` and `RoleModel.users` —
have no `lazy=` override and default to `lazy="select"` (classic,
synchronous lazy-loading). Appending to a `back_populates` relationship
makes SQLAlchemy sync the reverse collection too, which would silently
trigger that unawaited lazy load and raise
`sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called`.
Working against the `role_permissions` / `user_roles` association tables
directly (plain scalar IDs, Core-level `insert()`) sidesteps ORM
relationship loading entirely, so every database operation here is a
single, explicitly awaited `session.execute(...)` — no implicit I/O.

Password hashing goes exclusively through the existing `BcryptPasswordHasher`
(`app.infrastructure.security.password_hasher`) — no hash is ever
hardcoded here.

Prerequisites:
  - `backend/.env` configured (copy from `.env.example`) with a reachable
    `DATABASE_URL`.
  - Schema migrated: `alembic upgrade head`.

Usage (from the `backend/` directory):

    python -m app.db.seed

Default credentials (override via environment variables before running
anywhere real credentials matter):

    Email:    admin@medvoice.com
    Password: Admin@123
    Name:     System Administrator

Environment overrides:
    SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_FULL_NAME
"""

import asyncio
import logging
import os
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import AsyncSessionLocal
from app.infrastructure.models.associations import role_permissions, user_roles
from app.infrastructure.models.permission import PermissionModel
from app.infrastructure.models.role import RoleModel
from app.infrastructure.models.user import UserModel
from app.infrastructure.security.password_hasher import BcryptPasswordHasher

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("app.db.seed")

ADMIN_ROLE_NAME = "Administrator"
ADMIN_ROLE_DESCRIPTION = "Full system access. Granted every permission in the system."

# The permission catalog owned by this (Authentication/RBAC) bounded
# context. As further modules (Patients, Appointments, Billing, ...) are
# implemented they will register their own permissions; whatever the
# catalog contains at seed time, the Administrator role receives all of it.
PERMISSION_CATALOG: list[tuple[str, str]] = [
    ("users:read", "View user accounts"),
    ("users:create", "Create user accounts"),
    ("users:update", "Update user accounts"),
    ("users:delete", "Deactivate or delete user accounts"),
    ("roles:read", "View roles"),
    ("roles:create", "Create roles"),
    ("roles:update", "Update roles and their assigned permissions"),
    ("roles:delete", "Delete roles"),
    ("permissions:read", "View the available permission catalog"),
    # Patients bounded context (see app/modules/patients).
    ("patients:read", "View patient records"),
    ("patients:create", "Register new patients"),
    ("patients:update", "Update patient records"),
    ("patients:delete", "Deactivate (soft-delete) patient records"),
]

DEFAULT_ADMIN_EMAIL = "admin@medvoice.com"
DEFAULT_ADMIN_PASSWORD = "Admin@123"
DEFAULT_ADMIN_FULL_NAME = "System Administrator"


async def _seed_permissions(session: AsyncSession) -> list[PermissionModel]:
    """Ensures every catalog permission exists, then returns all of them."""
    stmt = pg_insert(PermissionModel).values(
        [{"code": code, "description": description} for code, description in PERMISSION_CATALOG]
    )
    stmt = stmt.on_conflict_do_nothing(index_elements=["code"])
    result = await session.execute(stmt)

    inserted = result.rowcount or 0
    logger.info(
        "Permission catalog: %d newly inserted, %d already present",
        inserted,
        len(PERMISSION_CATALOG) - inserted,
    )

    codes = [code for code, _ in PERMISSION_CATALOG]
    existing = await session.execute(select(PermissionModel).where(PermissionModel.code.in_(codes)))
    return list(existing.scalars().all())


async def _get_or_create_administrator_role(session: AsyncSession) -> UUID:
    """Fetches the Administrator role's id, creating the role if needed.

    Only ever reads/writes `RoleModel`'s own columns — never touches the
    `.permissions` relationship, so no reverse-side lazy load can fire.
    """
    existing = await session.execute(select(RoleModel.id).where(RoleModel.name == ADMIN_ROLE_NAME))
    role_id = existing.scalar_one_or_none()
    if role_id is not None:
        logger.info("Role %r already exists", ADMIN_ROLE_NAME)
        return role_id

    role = RoleModel(name=ADMIN_ROLE_NAME, description=ADMIN_ROLE_DESCRIPTION)
    session.add(role)
    await session.flush()
    logger.info("Created role %r", ADMIN_ROLE_NAME)
    return role.id


async def _grant_permissions_to_role(
    session: AsyncSession, role_id: UUID, permissions: list[PermissionModel]
) -> None:
    """Links every permission to the role via the `role_permissions` table directly."""
    if not permissions:
        return

    stmt = pg_insert(role_permissions).values(
        [{"role_id": role_id, "permission_id": permission.id} for permission in permissions]
    )
    stmt = stmt.on_conflict_do_nothing(index_elements=["role_id", "permission_id"])
    result = await session.execute(stmt)

    granted = result.rowcount or 0
    logger.info(
        "Role-permission grants for %r: %d newly linked, %d already linked",
        ADMIN_ROLE_NAME,
        granted,
        len(permissions) - granted,
    )


async def _get_or_create_admin_user(session: AsyncSession) -> UUID:
    """Fetches the admin user's id, creating the user (with a fresh hash) if needed.

    Only ever reads/writes `UserModel`'s own columns — never touches the
    `.roles` relationship, so no reverse-side lazy load can fire.
    """
    email = os.getenv("SEED_ADMIN_EMAIL", DEFAULT_ADMIN_EMAIL).strip().lower()
    password = os.getenv("SEED_ADMIN_PASSWORD", DEFAULT_ADMIN_PASSWORD)
    full_name = os.getenv("SEED_ADMIN_FULL_NAME", DEFAULT_ADMIN_FULL_NAME)

    existing = await session.execute(select(UserModel.id).where(UserModel.email == email))
    user_id = existing.scalar_one_or_none()
    if user_id is not None:
        logger.info("Admin user %r already exists — password left untouched", email)
        return user_id

    hasher = BcryptPasswordHasher()
    user = UserModel(
        email=email,
        hashed_password=hasher.hash(password),
        full_name=full_name,
        is_active=True,
        is_superuser=False,
    )
    session.add(user)
    await session.flush()
    logger.info("Created admin user %r", email)
    return user.id


async def _assign_role_to_user(session: AsyncSession, user_id: UUID, role_id: UUID) -> None:
    """Links the user to the role via the `user_roles` table directly."""
    stmt = pg_insert(user_roles).values(user_id=user_id, role_id=role_id)
    stmt = stmt.on_conflict_do_nothing(index_elements=["user_id", "role_id"])
    result = await session.execute(stmt)

    if result.rowcount:
        logger.info("Assigned %r role to admin user", ADMIN_ROLE_NAME)
    else:
        logger.info("Admin user already has the %r role", ADMIN_ROLE_NAME)


async def seed_auth() -> None:
    async with AsyncSessionLocal() as session:
        try:
            permissions = await _seed_permissions(session)
            role_id = await _get_or_create_administrator_role(session)
            await _grant_permissions_to_role(session, role_id, permissions)
            user_id = await _get_or_create_admin_user(session)
            await _assign_role_to_user(session, user_id, role_id)
            await session.commit()
            logger.info("Authentication seed completed successfully.")
        except Exception:
            await session.rollback()
            logger.exception("Authentication seed failed — transaction rolled back.")
            raise


def main() -> None:
    asyncio.run(seed_auth())


if __name__ == "__main__":
    main()
