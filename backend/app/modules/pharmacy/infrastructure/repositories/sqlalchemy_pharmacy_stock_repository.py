from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock
from app.modules.pharmacy.domain.entities.stock_movement import StockMovement
from app.modules.pharmacy.domain.exceptions import InsufficientStockError, PharmacyStockNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_batch_repository import PharmacyBatchRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import (
    InventoryListCriteria,
    InventoryPage,
    SortDirection,
    StockMovementListCriteria,
    StockMovementPage,
    StockMovementType,
)
from app.modules.pharmacy.infrastructure.models.pharmacy_model import (
    PharmacyBatchModel,
    PharmacyMedicineModel,
    PharmacyMedicineStockModel,
    StockMovementModel,
)
from app.modules.pharmacy.infrastructure.repositories.mappers import (
    pharmacy_stock_to_entity,
    stock_movement_to_entity,
)


class SqlAlchemyPharmacyStockRepository(PharmacyStockRepository):
    def __init__(self, session: AsyncSession, batch_repository: PharmacyBatchRepository) -> None:
        self._session = session
        self._batches = batch_repository

    async def get_by_medicine_id(self, medicine_id: UUID) -> PharmacyMedicineStock | None:
        medicine = aliased(PharmacyMedicineModel)
        result = await self._session.execute(
            select(PharmacyMedicineStockModel, medicine)
            .join(medicine, PharmacyMedicineStockModel.medicine_id == medicine.id)
            .where(
                PharmacyMedicineStockModel.medicine_id == medicine_id,
                medicine.deleted_at.is_(None),
            )
        )
        row = result.first()
        if not row:
            return None
        stock_model, med_model = row
        return pharmacy_stock_to_entity(stock_model, med_model)

    async def create_for_medicine(
        self,
        medicine_id: UUID,
        minimum_stock: int = 0,
        maximum_stock: int = 0,
    ) -> PharmacyMedicineStock:
        now = datetime.now(UTC)
        stock_id = uuid4()
        model = PharmacyMedicineStockModel(
            id=stock_id,
            medicine_id=medicine_id,
            current_stock=0,
            reserved_stock=0,
            minimum_stock=minimum_stock,
            maximum_stock=maximum_stock,
            updated_at=now,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_medicine_id(medicine_id)
        assert created is not None
        return created

    async def get_inventory(self, criteria: InventoryListCriteria) -> InventoryPage:
        medicine = aliased(PharmacyMedicineModel)
        conditions = [medicine.deleted_at.is_(None)]

        count_stmt = (
            select(func.count())
            .select_from(PharmacyMedicineStockModel)
            .join(medicine, PharmacyMedicineStockModel.medicine_id == medicine.id)
            .where(and_(*conditions))
        )
        total = int((await self._session.execute(count_stmt)).scalar_one())
        offset = (criteria.page - 1) * criteria.page_size

        order = (
            medicine.generic_name.desc()
            if criteria.sort_dir == SortDirection.DESC
            else medicine.generic_name.asc()
        )
        stmt = (
            select(PharmacyMedicineStockModel, medicine)
            .join(medicine, PharmacyMedicineStockModel.medicine_id == medicine.id)
            .where(and_(*conditions))
            .order_by(order)
            .offset(offset)
            .limit(criteria.page_size)
        )
        result = await self._session.execute(stmt)
        items = [pharmacy_stock_to_entity(row[0], row[1]) for row in result.all()]
        return InventoryPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def get_low_stock(self) -> list[PharmacyMedicineStock]:
        medicine = aliased(PharmacyMedicineModel)
        stmt = (
            select(PharmacyMedicineStockModel, medicine)
            .join(medicine, PharmacyMedicineStockModel.medicine_id == medicine.id)
            .where(
                medicine.deleted_at.is_(None),
                PharmacyMedicineStockModel.current_stock <= PharmacyMedicineStockModel.minimum_stock,
            )
            .order_by(PharmacyMedicineStockModel.current_stock.asc())
        )
        result = await self._session.execute(stmt)
        return [pharmacy_stock_to_entity(row[0], row[1]) for row in result.all()]

    async def adjust_stock(
        self,
        medicine_id: UUID,
        quantity_delta: int,
        movement_type: StockMovementType,
        notes: str | None,
        created_by: UUID | None,
        batch_id: UUID | None = None,
        reference_type: str | None = None,
        reference_id: UUID | None = None,
    ) -> tuple[PharmacyMedicineStock, StockMovement]:
        stock = await self.get_by_medicine_id(medicine_id)
        if stock is None:
            raise PharmacyStockNotFoundError("Stock record not found for this medicine.")

        new_stock = stock.current_stock + quantity_delta
        if new_stock < 0:
            raise InsufficientStockError("Insufficient stock for this operation.")

        now = datetime.now(UTC)
        await self._session.execute(
            update(PharmacyMedicineStockModel)
            .where(PharmacyMedicineStockModel.medicine_id == medicine_id)
            .values(current_stock=new_stock, updated_at=now)
        )

        movement = StockMovementModel(
            id=uuid4(),
            medicine_id=medicine_id,
            batch_id=batch_id,
            movement_type=movement_type.value,
            quantity_delta=quantity_delta,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=notes,
            created_by=created_by,
            created_at=now,
        )
        self._session.add(movement)
        await self._session.flush()

        updated_stock = await self.get_by_medicine_id(medicine_id)
        assert updated_stock is not None
        return updated_stock, stock_movement_to_entity(movement)

    async def get_movement_history(self, criteria: StockMovementListCriteria) -> StockMovementPage:
        medicine = aliased(PharmacyMedicineModel)
        batch = aliased(PharmacyBatchModel)
        conditions = []
        if criteria.medicine_id is not None:
            conditions.append(StockMovementModel.medicine_id == criteria.medicine_id)
        if criteria.movement_type is not None:
            conditions.append(StockMovementModel.movement_type == criteria.movement_type.value)

        count_stmt = select(func.count()).select_from(StockMovementModel)
        if conditions:
            count_stmt = count_stmt.where(and_(*conditions))
        total = int((await self._session.execute(count_stmt)).scalar_one())
        offset = (criteria.page - 1) * criteria.page_size

        stmt = (
            select(StockMovementModel, medicine, batch)
            .join(medicine, StockMovementModel.medicine_id == medicine.id)
            .outerjoin(batch, StockMovementModel.batch_id == batch.id)
        )
        if conditions:
            stmt = stmt.where(and_(*conditions))
        stmt = stmt.order_by(StockMovementModel.created_at.desc()).offset(offset).limit(criteria.page_size)

        result = await self._session.execute(stmt)
        items = [stock_movement_to_entity(row[0], row[1], row[2]) for row in result.all()]
        return StockMovementPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def decrement_for_dispense(
        self,
        medicine_id: UUID,
        batch_id: UUID | None,
        quantity: int,
        dispense_id: UUID,
        created_by: UUID | None,
    ) -> StockMovement:
        stock = await self.get_by_medicine_id(medicine_id)
        if stock is None:
            raise PharmacyStockNotFoundError("Stock record not found for this medicine.")
        if stock.current_stock < quantity:
            raise InsufficientStockError(f"Insufficient stock for medicine {medicine_id}.")

        if batch_id is not None:
            decremented = await self._batches.decrement_quantity(batch_id, quantity)
            if not decremented:
                raise InsufficientStockError(f"Insufficient quantity in batch {batch_id}.")

        now = datetime.now(UTC)
        await self._session.execute(
            update(PharmacyMedicineStockModel)
            .where(PharmacyMedicineStockModel.medicine_id == medicine_id)
            .values(
                current_stock=PharmacyMedicineStockModel.current_stock - quantity,
                updated_at=now,
            )
        )

        movement = StockMovementModel(
            id=uuid4(),
            medicine_id=medicine_id,
            batch_id=batch_id,
            movement_type=StockMovementType.DISPENSE.value,
            quantity_delta=-quantity,
            reference_type="dispense",
            reference_id=dispense_id,
            notes=f"Dispensed via {dispense_id}",
            created_by=created_by,
            created_at=now,
        )
        self._session.add(movement)
        await self._session.flush()
        return stock_movement_to_entity(movement)
