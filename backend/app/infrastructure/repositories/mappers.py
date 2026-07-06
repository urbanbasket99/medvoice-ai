"""Pure functions converting persistence models to domain entities.

Isolating this translation here keeps `UserModel`/`RoleModel`/etc. (which
carry SQLAlchemy-specific relationship-loading concerns) from ever leaking
into the domain or application layers.
"""

from app.domain.entities.permission import Permission
from app.domain.entities.refresh_token import RefreshToken
from app.domain.entities.role import Role
from app.domain.entities.user import User
from app.infrastructure.models.permission import PermissionModel
from app.infrastructure.models.refresh_token import RefreshTokenModel
from app.infrastructure.models.role import RoleModel
from app.infrastructure.models.user import UserModel


def permission_to_entity(model: PermissionModel) -> Permission:
    return Permission(id=model.id, code=model.code, description=model.description)


def role_to_entity(model: RoleModel) -> Role:
    return Role(
        id=model.id,
        name=model.name,
        description=model.description,
        permissions=[permission_to_entity(permission) for permission in model.permissions],
    )


def user_to_entity(model: UserModel) -> User:
    return User(
        id=model.id,
        email=model.email,
        hashed_password=model.hashed_password,
        full_name=model.full_name,
        is_active=model.is_active,
        is_superuser=model.is_superuser,
        created_at=model.created_at,
        updated_at=model.updated_at,
        roles=[role_to_entity(role) for role in model.roles],
    )


def refresh_token_to_entity(model: RefreshTokenModel) -> RefreshToken:
    return RefreshToken(
        id=model.id,
        user_id=model.user_id,
        token_hash=model.token_hash,
        expires_at=model.expires_at,
        created_at=model.created_at,
        revoked_at=model.revoked_at,
        replaced_by_token_id=model.replaced_by_token_id,
    )
