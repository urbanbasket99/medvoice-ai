from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.accounts.application.accounts_service import AccountsService


def get_accounts_service(db: DbSession) -> AccountsService:
    return AccountsService(db)


AccountsServiceDep = Annotated[AccountsService, Depends(get_accounts_service)]

RequireAccountsRead = Annotated[User, Depends(require_permission("accounts:read"))]
RequireAccountsCreate = Annotated[User, Depends(require_permission("accounts:create"))]
