from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.pharmacy.application.interfaces.pharmacy_dispense_number_generator import (
    PharmacyDispenseNumberGenerator,
)
from app.modules.pharmacy.application.interfaces.prescription_lookup import PrescriptionLookup
from app.modules.pharmacy.application.interfaces.vendor_payment_number_generator import (
    VendorPaymentNumberGenerator,
)
from app.modules.pharmacy.application.use_cases.create_supplier import CreateSupplierUseCase
from app.modules.pharmacy.application.use_cases.create_vendor_payment import CreateVendorPaymentUseCase
from app.modules.pharmacy.application.use_cases.get_medicine_by_barcode import GetMedicineByBarcodeUseCase
from app.modules.pharmacy.application.use_cases.get_supplier import GetSupplierUseCase
from app.modules.pharmacy.application.use_cases.list_vendor_payments import ListVendorPaymentsUseCase
from app.modules.pharmacy.application.use_cases.return_stock import ReturnStockUseCase
from app.modules.pharmacy.application.use_cases.update_supplier import UpdateSupplierUseCase
from app.modules.pharmacy.application.use_cases.adjust_stock import AdjustStockUseCase
from app.modules.pharmacy.application.use_cases.create_batch import CreateBatchUseCase
from app.modules.pharmacy.application.use_cases.create_dispense import CreateDispenseUseCase
from app.modules.pharmacy.application.use_cases.create_medicine import CreateMedicineUseCase
from app.modules.pharmacy.application.use_cases.delete_dispense import DeleteDispenseUseCase
from app.modules.pharmacy.application.use_cases.delete_medicine import DeleteMedicineUseCase
from app.modules.pharmacy.application.use_cases.get_dispense import GetDispenseUseCase
from app.modules.pharmacy.application.use_cases.get_dispense_print import GetDispensePrintUseCase
from app.modules.pharmacy.application.use_cases.get_dispenses import GetDispensesUseCase
from app.modules.pharmacy.application.use_cases.get_dispenses_by_prescription import (
    GetDispensesByPrescriptionUseCase,
)
from app.modules.pharmacy.application.use_cases.get_inventory import GetInventoryUseCase
from app.modules.pharmacy.application.use_cases.get_low_stock import GetLowStockUseCase
from app.modules.pharmacy.application.use_cases.get_medicine import GetMedicineUseCase
from app.modules.pharmacy.application.use_cases.get_medicines import GetMedicinesUseCase
from app.modules.pharmacy.application.use_cases.get_stock_by_medicine import GetStockByMedicineUseCase
from app.modules.pharmacy.application.use_cases.get_stock_history import GetStockHistoryUseCase
from app.modules.pharmacy.application.use_cases.get_suppliers import GetSuppliersUseCase
from app.modules.pharmacy.application.use_cases.list_batches_by_medicine import ListBatchesByMedicineUseCase
from app.modules.pharmacy.application.use_cases.search_dispenses import SearchDispensesUseCase
from app.modules.pharmacy.application.use_cases.search_medicines import SearchMedicinesUseCase
from app.modules.pharmacy.application.use_cases.update_batch import UpdateBatchUseCase
from app.modules.pharmacy.application.use_cases.update_dispense import UpdateDispenseUseCase
from app.modules.pharmacy.application.use_cases.update_dispense_status import UpdateDispenseStatusUseCase
from app.modules.pharmacy.application.use_cases.update_medicine import UpdateMedicineUseCase
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.repositories.pharmacy_batch_repository import PharmacyBatchRepository
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository
from app.modules.pharmacy.domain.repositories.vendor_payment_repository import VendorPaymentRepository
from app.modules.pharmacy.infrastructure.pharmacy_dispense_number_generator import (
    SqlAlchemyPharmacyDispenseNumberGenerator,
)
from app.modules.pharmacy.infrastructure.repositories.prescription_lookup import SqlAlchemyPrescriptionLookup
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_dispense_record_repository import (
    SqlAlchemyDispenseRecordRepository,
)
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_pharmacy_batch_repository import (
    SqlAlchemyPharmacyBatchRepository,
)
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_pharmacy_medicine_repository import (
    SqlAlchemyPharmacyMedicineRepository,
)
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_pharmacy_stock_repository import (
    SqlAlchemyPharmacyStockRepository,
)
from app.modules.pharmacy.infrastructure.vendor_payment_number_generator import (
    SqlAlchemyVendorPaymentNumberGenerator,
)
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_pharmacy_supplier_repository import (
    SqlAlchemyPharmacySupplierRepository,
)
from app.modules.pharmacy.infrastructure.repositories.sqlalchemy_vendor_payment_repository import (
    SqlAlchemyVendorPaymentRepository,
)


def get_pharmacy_medicine_repository(db: DbSession) -> PharmacyMedicineRepository:
    return SqlAlchemyPharmacyMedicineRepository(db)


def get_pharmacy_supplier_repository(db: DbSession) -> PharmacySupplierRepository:
    return SqlAlchemyPharmacySupplierRepository(db)


def get_vendor_payment_repository(db: DbSession) -> VendorPaymentRepository:
    return SqlAlchemyVendorPaymentRepository(db)


def get_pharmacy_batch_repository(db: DbSession) -> PharmacyBatchRepository:
    return SqlAlchemyPharmacyBatchRepository(db)


def get_pharmacy_stock_repository(
    db: DbSession,
    batch_repository: Annotated[PharmacyBatchRepository, Depends(get_pharmacy_batch_repository)],
) -> PharmacyStockRepository:
    return SqlAlchemyPharmacyStockRepository(db, batch_repository)


def get_dispense_record_repository(db: DbSession) -> DispenseRecordRepository:
    return SqlAlchemyDispenseRecordRepository(db)


def get_prescription_lookup(db: DbSession) -> PrescriptionLookup:
    return SqlAlchemyPrescriptionLookup(db)


def get_pharmacy_dispense_number_generator(db: DbSession) -> PharmacyDispenseNumberGenerator:
    return SqlAlchemyPharmacyDispenseNumberGenerator(db)


def get_vendor_payment_number_generator(db: DbSession) -> VendorPaymentNumberGenerator:
    return SqlAlchemyVendorPaymentNumberGenerator(db)


PharmacyMedicineRepositoryDep = Annotated[PharmacyMedicineRepository, Depends(get_pharmacy_medicine_repository)]
PharmacySupplierRepositoryDep = Annotated[PharmacySupplierRepository, Depends(get_pharmacy_supplier_repository)]
VendorPaymentRepositoryDep = Annotated[VendorPaymentRepository, Depends(get_vendor_payment_repository)]
PharmacyBatchRepositoryDep = Annotated[PharmacyBatchRepository, Depends(get_pharmacy_batch_repository)]
PharmacyStockRepositoryDep = Annotated[PharmacyStockRepository, Depends(get_pharmacy_stock_repository)]
DispenseRecordRepositoryDep = Annotated[DispenseRecordRepository, Depends(get_dispense_record_repository)]
PrescriptionLookupDep = Annotated[PrescriptionLookup, Depends(get_prescription_lookup)]
PharmacyDispenseNumberGeneratorDep = Annotated[
    PharmacyDispenseNumberGenerator, Depends(get_pharmacy_dispense_number_generator)
]
VendorPaymentNumberGeneratorDep = Annotated[
    VendorPaymentNumberGenerator, Depends(get_vendor_payment_number_generator)
]


def provide_create_medicine_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
    stock_repository: PharmacyStockRepositoryDep,
) -> CreateMedicineUseCase:
    return CreateMedicineUseCase(medicine_repository, stock_repository)


def provide_update_medicine_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> UpdateMedicineUseCase:
    return UpdateMedicineUseCase(medicine_repository)


def provide_delete_medicine_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> DeleteMedicineUseCase:
    return DeleteMedicineUseCase(medicine_repository)


def provide_get_medicine_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> GetMedicineUseCase:
    return GetMedicineUseCase(medicine_repository)


def provide_get_medicines_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> GetMedicinesUseCase:
    return GetMedicinesUseCase(medicine_repository)


def provide_search_medicines_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> SearchMedicinesUseCase:
    return SearchMedicinesUseCase(medicine_repository)


def provide_create_batch_use_case(
    batch_repository: PharmacyBatchRepositoryDep,
    medicine_repository: PharmacyMedicineRepositoryDep,
    stock_repository: PharmacyStockRepositoryDep,
) -> CreateBatchUseCase:
    return CreateBatchUseCase(batch_repository, medicine_repository, stock_repository)


def provide_update_batch_use_case(
    batch_repository: PharmacyBatchRepositoryDep,
) -> UpdateBatchUseCase:
    return UpdateBatchUseCase(batch_repository)


def provide_list_batches_by_medicine_use_case(
    batch_repository: PharmacyBatchRepositoryDep,
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> ListBatchesByMedicineUseCase:
    return ListBatchesByMedicineUseCase(batch_repository, medicine_repository)


def provide_get_inventory_use_case(
    stock_repository: PharmacyStockRepositoryDep,
) -> GetInventoryUseCase:
    return GetInventoryUseCase(stock_repository)


def provide_get_stock_by_medicine_use_case(
    stock_repository: PharmacyStockRepositoryDep,
) -> GetStockByMedicineUseCase:
    return GetStockByMedicineUseCase(stock_repository)


def provide_adjust_stock_use_case(
    stock_repository: PharmacyStockRepositoryDep,
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> AdjustStockUseCase:
    return AdjustStockUseCase(stock_repository, medicine_repository)


def provide_get_stock_history_use_case(
    stock_repository: PharmacyStockRepositoryDep,
) -> GetStockHistoryUseCase:
    return GetStockHistoryUseCase(stock_repository)


def provide_get_low_stock_use_case(
    stock_repository: PharmacyStockRepositoryDep,
) -> GetLowStockUseCase:
    return GetLowStockUseCase(stock_repository)


def provide_get_suppliers_use_case(
    supplier_repository: PharmacySupplierRepositoryDep,
) -> GetSuppliersUseCase:
    return GetSuppliersUseCase(supplier_repository)


def provide_get_supplier_use_case(
    supplier_repository: PharmacySupplierRepositoryDep,
) -> GetSupplierUseCase:
    return GetSupplierUseCase(supplier_repository)


def provide_create_supplier_use_case(
    supplier_repository: PharmacySupplierRepositoryDep,
) -> CreateSupplierUseCase:
    return CreateSupplierUseCase(supplier_repository)


def provide_update_supplier_use_case(
    supplier_repository: PharmacySupplierRepositoryDep,
) -> UpdateSupplierUseCase:
    return UpdateSupplierUseCase(supplier_repository)


def provide_list_vendor_payments_use_case(
    payment_repository: VendorPaymentRepositoryDep,
) -> ListVendorPaymentsUseCase:
    return ListVendorPaymentsUseCase(payment_repository)


def provide_create_vendor_payment_use_case(
    payment_repository: VendorPaymentRepositoryDep,
    supplier_repository: PharmacySupplierRepositoryDep,
    payment_number_generator: VendorPaymentNumberGeneratorDep,
) -> CreateVendorPaymentUseCase:
    return CreateVendorPaymentUseCase(
        payment_repository, supplier_repository, payment_number_generator
    )


def provide_get_medicine_by_barcode_use_case(
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> GetMedicineByBarcodeUseCase:
    return GetMedicineByBarcodeUseCase(medicine_repository)


def provide_return_stock_use_case(
    stock_repository: PharmacyStockRepositoryDep,
    medicine_repository: PharmacyMedicineRepositoryDep,
) -> ReturnStockUseCase:
    return ReturnStockUseCase(stock_repository, medicine_repository)


def provide_create_dispense_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
    prescription_lookup: PrescriptionLookupDep,
    order_number_generator: PharmacyDispenseNumberGeneratorDep,
    stock_repository: PharmacyStockRepositoryDep,
    db: DbSession,
) -> CreateDispenseUseCase:
    return CreateDispenseUseCase(
        dispense_repository, prescription_lookup, order_number_generator, stock_repository, db
    )


def provide_update_dispense_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> UpdateDispenseUseCase:
    return UpdateDispenseUseCase(dispense_repository)


def provide_update_dispense_status_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
    stock_repository: PharmacyStockRepositoryDep,
) -> UpdateDispenseStatusUseCase:
    return UpdateDispenseStatusUseCase(dispense_repository, stock_repository)


def provide_get_dispense_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> GetDispenseUseCase:
    return GetDispenseUseCase(dispense_repository)


def provide_get_dispenses_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> GetDispensesUseCase:
    return GetDispensesUseCase(dispense_repository)


def provide_search_dispenses_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> SearchDispensesUseCase:
    return SearchDispensesUseCase(dispense_repository)


def provide_delete_dispense_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> DeleteDispenseUseCase:
    return DeleteDispenseUseCase(dispense_repository)


def provide_get_dispense_print_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> GetDispensePrintUseCase:
    return GetDispensePrintUseCase(dispense_repository)


def provide_get_dispenses_by_prescription_use_case(
    dispense_repository: DispenseRecordRepositoryDep,
) -> GetDispensesByPrescriptionUseCase:
    return GetDispensesByPrescriptionUseCase(dispense_repository)


CreateMedicineUseCaseDep = Annotated[CreateMedicineUseCase, Depends(provide_create_medicine_use_case)]
UpdateMedicineUseCaseDep = Annotated[UpdateMedicineUseCase, Depends(provide_update_medicine_use_case)]
DeleteMedicineUseCaseDep = Annotated[DeleteMedicineUseCase, Depends(provide_delete_medicine_use_case)]
GetMedicineUseCaseDep = Annotated[GetMedicineUseCase, Depends(provide_get_medicine_use_case)]
GetMedicinesUseCaseDep = Annotated[GetMedicinesUseCase, Depends(provide_get_medicines_use_case)]
SearchMedicinesUseCaseDep = Annotated[SearchMedicinesUseCase, Depends(provide_search_medicines_use_case)]
CreateBatchUseCaseDep = Annotated[CreateBatchUseCase, Depends(provide_create_batch_use_case)]
UpdateBatchUseCaseDep = Annotated[UpdateBatchUseCase, Depends(provide_update_batch_use_case)]
ListBatchesByMedicineUseCaseDep = Annotated[
    ListBatchesByMedicineUseCase, Depends(provide_list_batches_by_medicine_use_case)
]
GetInventoryUseCaseDep = Annotated[GetInventoryUseCase, Depends(provide_get_inventory_use_case)]
GetStockByMedicineUseCaseDep = Annotated[GetStockByMedicineUseCase, Depends(provide_get_stock_by_medicine_use_case)]
AdjustStockUseCaseDep = Annotated[AdjustStockUseCase, Depends(provide_adjust_stock_use_case)]
GetStockHistoryUseCaseDep = Annotated[GetStockHistoryUseCase, Depends(provide_get_stock_history_use_case)]
GetLowStockUseCaseDep = Annotated[GetLowStockUseCase, Depends(provide_get_low_stock_use_case)]
GetSuppliersUseCaseDep = Annotated[GetSuppliersUseCase, Depends(provide_get_suppliers_use_case)]
GetSupplierUseCaseDep = Annotated[GetSupplierUseCase, Depends(provide_get_supplier_use_case)]
CreateSupplierUseCaseDep = Annotated[CreateSupplierUseCase, Depends(provide_create_supplier_use_case)]
UpdateSupplierUseCaseDep = Annotated[UpdateSupplierUseCase, Depends(provide_update_supplier_use_case)]
ListVendorPaymentsUseCaseDep = Annotated[
    ListVendorPaymentsUseCase, Depends(provide_list_vendor_payments_use_case)
]
CreateVendorPaymentUseCaseDep = Annotated[
    CreateVendorPaymentUseCase, Depends(provide_create_vendor_payment_use_case)
]
GetMedicineByBarcodeUseCaseDep = Annotated[
    GetMedicineByBarcodeUseCase, Depends(provide_get_medicine_by_barcode_use_case)
]
ReturnStockUseCaseDep = Annotated[ReturnStockUseCase, Depends(provide_return_stock_use_case)]
CreateDispenseUseCaseDep = Annotated[CreateDispenseUseCase, Depends(provide_create_dispense_use_case)]
UpdateDispenseUseCaseDep = Annotated[UpdateDispenseUseCase, Depends(provide_update_dispense_use_case)]
UpdateDispenseStatusUseCaseDep = Annotated[
    UpdateDispenseStatusUseCase, Depends(provide_update_dispense_status_use_case)
]
GetDispenseUseCaseDep = Annotated[GetDispenseUseCase, Depends(provide_get_dispense_use_case)]
GetDispensesUseCaseDep = Annotated[GetDispensesUseCase, Depends(provide_get_dispenses_use_case)]
SearchDispensesUseCaseDep = Annotated[SearchDispensesUseCase, Depends(provide_search_dispenses_use_case)]
DeleteDispenseUseCaseDep = Annotated[DeleteDispenseUseCase, Depends(provide_delete_dispense_use_case)]
GetDispensePrintUseCaseDep = Annotated[GetDispensePrintUseCase, Depends(provide_get_dispense_print_use_case)]
GetDispensesByPrescriptionUseCaseDep = Annotated[
    GetDispensesByPrescriptionUseCase, Depends(provide_get_dispenses_by_prescription_use_case)
]

RequirePharmacyRead = Annotated[User, Depends(require_permission("pharmacy:read"))]
RequirePharmacyCreate = Annotated[User, Depends(require_permission("pharmacy:create"))]
RequirePharmacyUpdate = Annotated[User, Depends(require_permission("pharmacy:update"))]
RequirePharmacyDelete = Annotated[User, Depends(require_permission("pharmacy:delete"))]
