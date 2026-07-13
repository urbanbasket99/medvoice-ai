from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.certificates.application.interfaces.certificate_number_generator import (
    CertificateNumberGenerator,
)
from app.modules.certificates.application.use_cases.create_certificate import CreateCertificateUseCase
from app.modules.certificates.application.use_cases.delete_certificate import DeleteCertificateUseCase
from app.modules.certificates.application.use_cases.get_certificate import GetCertificateUseCase
from app.modules.certificates.application.use_cases.get_certificate_print import (
    GetCertificatePrintUseCase,
)
from app.modules.certificates.application.use_cases.get_certificates import GetCertificatesUseCase
from app.modules.certificates.application.use_cases.update_certificate import UpdateCertificateUseCase
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)
from app.modules.certificates.infrastructure.certificate_number_generator import (
    SqlAlchemyCertificateNumberGenerator,
)
from app.modules.certificates.infrastructure.repositories.sqlalchemy_medical_certificate_repository import (
    SqlAlchemyMedicalCertificateRepository,
)


def get_certificate_repository(db: DbSession) -> MedicalCertificateRepository:
    return SqlAlchemyMedicalCertificateRepository(db)


def get_certificate_number_generator(db: DbSession) -> CertificateNumberGenerator:
    return SqlAlchemyCertificateNumberGenerator(db)


CertificateRepositoryDep = Annotated[
    MedicalCertificateRepository, Depends(get_certificate_repository)
]
CertificateNumberGeneratorDep = Annotated[
    CertificateNumberGenerator, Depends(get_certificate_number_generator)
]


def provide_create_certificate_use_case(
    certificate_repository: CertificateRepositoryDep,
    number_generator: CertificateNumberGeneratorDep,
) -> CreateCertificateUseCase:
    return CreateCertificateUseCase(certificate_repository, number_generator)


def provide_update_certificate_use_case(
    certificate_repository: CertificateRepositoryDep,
) -> UpdateCertificateUseCase:
    return UpdateCertificateUseCase(certificate_repository)


def provide_delete_certificate_use_case(
    certificate_repository: CertificateRepositoryDep,
) -> DeleteCertificateUseCase:
    return DeleteCertificateUseCase(certificate_repository)


def provide_get_certificate_use_case(
    certificate_repository: CertificateRepositoryDep,
) -> GetCertificateUseCase:
    return GetCertificateUseCase(certificate_repository)


def provide_get_certificates_use_case(
    certificate_repository: CertificateRepositoryDep,
) -> GetCertificatesUseCase:
    return GetCertificatesUseCase(certificate_repository)


def provide_get_certificate_print_use_case(
    certificate_repository: CertificateRepositoryDep,
) -> GetCertificatePrintUseCase:
    return GetCertificatePrintUseCase(certificate_repository)


CreateCertificateUseCaseDep = Annotated[
    CreateCertificateUseCase, Depends(provide_create_certificate_use_case)
]
UpdateCertificateUseCaseDep = Annotated[
    UpdateCertificateUseCase, Depends(provide_update_certificate_use_case)
]
DeleteCertificateUseCaseDep = Annotated[
    DeleteCertificateUseCase, Depends(provide_delete_certificate_use_case)
]
GetCertificateUseCaseDep = Annotated[
    GetCertificateUseCase, Depends(provide_get_certificate_use_case)
]
GetCertificatesUseCaseDep = Annotated[
    GetCertificatesUseCase, Depends(provide_get_certificates_use_case)
]
GetCertificatePrintUseCaseDep = Annotated[
    GetCertificatePrintUseCase, Depends(provide_get_certificate_print_use_case)
]

RequireCertificatesRead = Annotated[User, Depends(require_permission("certificates:read"))]
RequireCertificatesCreate = Annotated[User, Depends(require_permission("certificates:create"))]
RequireCertificatesUpdate = Annotated[User, Depends(require_permission("certificates:update"))]
RequireCertificatesDelete = Annotated[User, Depends(require_permission("certificates:delete"))]
