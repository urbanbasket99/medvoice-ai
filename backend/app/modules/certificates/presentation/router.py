from dataclasses import replace
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.certificates.domain.value_objects import (
    CertificateListCriteria,
    CertificateSortField,
    CertificateType,
    SortDirection,
)
from app.modules.certificates.presentation.dependencies import (
    CreateCertificateUseCaseDep,
    DeleteCertificateUseCaseDep,
    GetCertificatePrintUseCaseDep,
    GetCertificateUseCaseDep,
    GetCertificatesUseCaseDep,
    RequireCertificatesCreate,
    RequireCertificatesDelete,
    RequireCertificatesRead,
    RequireCertificatesUpdate,
    UpdateCertificateUseCaseDep,
)
from app.modules.certificates.presentation.schemas import (
    CertificateCreateRequest,
    CertificateListResponse,
    CertificatePrintResponse,
    CertificateResponse,
    CertificateUpdateRequest,
)

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("", response_model=CertificateListResponse)
async def list_certificates(
    _: RequireCertificatesRead,
    use_case: GetCertificatesUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: CertificateSortField = CertificateSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    certificate_type: CertificateType | None = None,
) -> CertificateListResponse:
    criteria = CertificateListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        patient_id=patient_id,
        doctor_id=doctor_id,
        certificate_type=certificate_type,
    )
    result = await use_case.execute(criteria)
    return CertificateListResponse.from_page(result)


@router.get("/{certificate_id}/print", response_model=CertificatePrintResponse)
async def print_certificate(
    certificate_id: UUID,
    _: RequireCertificatesRead,
    use_case: GetCertificatePrintUseCaseDep,
) -> CertificatePrintResponse:
    output = await use_case.execute(certificate_id)
    return CertificatePrintResponse.from_output(output)


@router.get("/{certificate_id}", response_model=CertificateResponse)
async def get_certificate(
    certificate_id: UUID,
    _: RequireCertificatesRead,
    use_case: GetCertificateUseCaseDep,
) -> CertificateResponse:
    certificate = await use_case.execute(certificate_id)
    return CertificateResponse.from_entity(certificate)


@router.post("", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    payload: CertificateCreateRequest,
    current_user: RequireCertificatesCreate,
    use_case: CreateCertificateUseCaseDep,
) -> CertificateResponse:
    data = payload.to_input()
    if data.issued_by is None:
        data = replace(data, issued_by=current_user.id)
    certificate = await use_case.execute(data)
    return CertificateResponse.from_entity(certificate)


@router.put("/{certificate_id}", response_model=CertificateResponse)
async def update_certificate(
    certificate_id: UUID,
    payload: CertificateUpdateRequest,
    _: RequireCertificatesUpdate,
    use_case: UpdateCertificateUseCaseDep,
) -> CertificateResponse:
    certificate = await use_case.execute(certificate_id, payload.to_input())
    return CertificateResponse.from_entity(certificate)


@router.delete("/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(
    certificate_id: UUID,
    _: RequireCertificatesDelete,
    use_case: DeleteCertificateUseCaseDep,
) -> None:
    await use_case.execute(certificate_id)
