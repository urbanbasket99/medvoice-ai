"""Alembic migration environment.

Uses SQLAlchemy 2.0's async engine (the same one the application runs on)
via `AsyncEngine.run_sync`, per Alembic's documented recipe for async
drivers — see https://alembic.sqlalchemy.org/en/latest/cookbook.html#using-asyncio-with-alembic.
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import Connection, pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import get_settings
from app.db.base import Base

# Import every model module so `Base.metadata` is fully populated before
# `--autogenerate` inspects it.
from app.infrastructure.models import (  # noqa: F401
    PermissionModel,
    RefreshTokenModel,
    RoleModel,
    UserModel,
    role_permissions,
    user_roles,
)
from app.modules.patients.infrastructure.models import PatientModel  # noqa: F401
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel  # noqa: F401
from app.modules.doctors.infrastructure.models.doctor_availability_slot_model import (  # noqa: F401
    DoctorAvailabilitySlotModel,
)
from app.modules.billing.infrastructure.models.billing_model import (  # noqa: F401
    InsuranceClaimModel,
    InvoiceItemModel,
    InvoiceModel,
    InvoiceStatusEventModel,
    PaymentModel,
    TpaModel,
)
from app.modules.certificates.infrastructure.models.medical_certificate_model import (  # noqa: F401
    MedicalCertificateModel,
)
from app.modules.accounts.infrastructure.models.accounts_model import (  # noqa: F401
    AccountVendorModel,
    ChartOfAccountModel,
    ExpenseVoucherModel,
    IncomeVoucherModel,
    JournalEntryModel,
    JournalLineModel,
    VendorBillModel,
    VendorPaymentModel,
)
from app.modules.ipd.infrastructure.models.ipd_model import (  # noqa: F401
    IpdAdmissionModel,
    IpdBedModel,
    IpdChargeModel,
    IpdMlcCaseModel,
    IpdNursingNoteModel,
    IpdOtScheduleModel,
    IpdWardModel,
)
from app.modules.laboratory.infrastructure.models.lab_order_model import (  # noqa: F401
    LabOrderItemModel,
    LabOrderModel,
)
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(_do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
