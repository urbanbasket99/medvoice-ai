from enum import StrEnum


class AccountType(StrEnum):
    ASSET = "asset"
    LIABILITY = "liability"
    EQUITY = "equity"
    INCOME = "income"
    EXPENSE = "expense"


class JournalEntryType(StrEnum):
    MANUAL = "manual"
    EXPENSE = "expense"
    INCOME = "income"
    VENDOR_BILL = "vendor_bill"
    VENDOR_PAYMENT = "vendor_payment"


class VendorBillStatus(StrEnum):
    OPEN = "open"
    PARTIAL = "partial"
    PAID = "paid"
