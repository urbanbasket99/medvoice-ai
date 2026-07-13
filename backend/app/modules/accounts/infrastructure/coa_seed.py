from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

DEFAULT_COA = [
    ("1000", "Cash", "asset"),
    ("1100", "Bank", "asset"),
    ("2000", "Accounts Payable", "liability"),
    ("4000", "Patient Revenue", "income"),
    ("4100", "Other Income", "income"),
    ("5000", "Salaries Expense", "expense"),
    ("5100", "Utilities Expense", "expense"),
    ("5200", "Supplies Expense", "expense"),
]


async def seed_chart_of_accounts(session: AsyncSession) -> int:
    inserted = 0
    for code, name, account_type in DEFAULT_COA:
        result = await session.execute(
            text(
                """
                INSERT INTO chart_of_accounts (id, code, name, account_type, is_active)
                VALUES (:id, :code, :name, :account_type, true)
                ON CONFLICT (code) DO NOTHING
                """
            ),
            {"id": uuid4(), "code": code, "name": name, "account_type": account_type},
        )
        inserted += result.rowcount or 0
    return inserted
