export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export interface Account {
  id: string;
  code: string;
  name: string;
  accountType: AccountType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string;
  expenseAccountId: string;
  paymentAccountId: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export interface IncomeVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string;
  incomeAccountId: string;
  receiptAccountId: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export interface CashBookRow {
  entryDate: string;
  entryNumber: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface AccountVendor {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  vendorId: string;
  billDate: string;
  dueDate: string | null;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
  description: string | null;
}

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  vendorBillId: string;
  paymentAccountId: string;
  amount: number;
  paymentDate: string;
  referenceNumber: string | null;
}

export interface ApOutstandingRow {
  billId: string;
  billNumber: string;
  vendorName: string;
  billDate: string;
  dueDate: string | null;
  amount: number;
  paidAmount: number;
  balance: number;
  status: string;
}
