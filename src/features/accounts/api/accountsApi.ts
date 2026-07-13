import { httpClient } from "../../auth/api/httpClient";
import type {
  Account,
  AccountType,
  AccountVendor,
  ApOutstandingRow,
  CashBookRow,
  ExpenseVoucher,
  IncomeVoucher,
  TrialBalanceRow,
  VendorBill,
  VendorPayment,
} from "../types/accounts.types";

const toAccount = (r: {
  id: string;
  code: string;
  name: string;
  account_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}): Account => ({
  id: r.id,
  code: r.code,
  name: r.name,
  accountType: r.account_type as AccountType,
  isActive: r.is_active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const accountsApi = {
  async listAccounts(accountType?: AccountType): Promise<Account[]> {
    const { data } = await httpClient.get<{ items: Parameters<typeof toAccount>[0][] }>("/accounts/chart", {
      params: accountType ? { account_type: accountType } : undefined,
    });
    return data.items.map(toAccount);
  },

  async createAccount(payload: { code: string; name: string; accountType: AccountType }): Promise<Account> {
    const { data } = await httpClient.post<Parameters<typeof toAccount>[0]>("/accounts/chart", {
      code: payload.code,
      name: payload.name,
      account_type: payload.accountType,
    });
    return toAccount(data);
  },

  async listExpenseVouchers(): Promise<ExpenseVoucher[]> {
    const { data } = await httpClient.get<Array<{
      id: string; voucher_number: string; voucher_date: string; expense_account_id: string;
      payment_account_id: string; amount: number; description: string | null; created_at: string;
    }>>("/accounts/expenses");
    return data.map((v) => ({
      id: v.id,
      voucherNumber: v.voucher_number,
      voucherDate: v.voucher_date,
      expenseAccountId: v.expense_account_id,
      paymentAccountId: v.payment_account_id,
      amount: v.amount,
      description: v.description,
      createdAt: v.created_at,
    }));
  },

  async createExpenseVoucher(payload: {
    voucherDate: string;
    expenseAccountId: string;
    paymentAccountId: string;
    amount: number;
    description?: string;
  }): Promise<ExpenseVoucher> {
    const { data } = await httpClient.post("/accounts/expenses", {
      voucher_date: payload.voucherDate,
      expense_account_id: payload.expenseAccountId,
      payment_account_id: payload.paymentAccountId,
      amount: payload.amount,
      description: payload.description ?? null,
    });
    return {
      id: data.id,
      voucherNumber: data.voucher_number,
      voucherDate: data.voucher_date,
      expenseAccountId: data.expense_account_id,
      paymentAccountId: data.payment_account_id,
      amount: data.amount,
      description: data.description,
      createdAt: data.created_at,
    };
  },

  async listIncomeVouchers(): Promise<IncomeVoucher[]> {
    const { data } = await httpClient.get<Array<{
      id: string; voucher_number: string; voucher_date: string; income_account_id: string;
      receipt_account_id: string; amount: number; description: string | null; created_at: string;
    }>>("/accounts/income");
    return data.map((v) => ({
      id: v.id,
      voucherNumber: v.voucher_number,
      voucherDate: v.voucher_date,
      incomeAccountId: v.income_account_id,
      receiptAccountId: v.receipt_account_id,
      amount: v.amount,
      description: v.description,
      createdAt: v.created_at,
    }));
  },

  async createIncomeVoucher(payload: {
    voucherDate: string;
    incomeAccountId: string;
    receiptAccountId: string;
    amount: number;
    description?: string;
  }): Promise<IncomeVoucher> {
    const { data } = await httpClient.post("/accounts/income", {
      voucher_date: payload.voucherDate,
      income_account_id: payload.incomeAccountId,
      receipt_account_id: payload.receiptAccountId,
      amount: payload.amount,
      description: payload.description ?? null,
    });
    return {
      id: data.id,
      voucherNumber: data.voucher_number,
      voucherDate: data.voucher_date,
      incomeAccountId: data.income_account_id,
      receiptAccountId: data.receipt_account_id,
      amount: data.amount,
      description: data.description,
      createdAt: data.created_at,
    };
  },

  async getCashBook(dateFrom: string, dateTo: string): Promise<CashBookRow[]> {
    const { data } = await httpClient.get<{ items: Array<{
      entry_date: string; entry_number: string; description: string;
      account_code: string; account_name: string; debit: number; credit: number;
    }> }>("/accounts/cash-book", { params: { date_from: dateFrom, date_to: dateTo } });
    return data.items.map((r) => ({
      entryDate: r.entry_date,
      entryNumber: r.entry_number,
      description: r.description,
      accountCode: r.account_code,
      accountName: r.account_name,
      debit: r.debit,
      credit: r.credit,
    }));
  },

  async getTrialBalance(asOf: string): Promise<TrialBalanceRow[]> {
    const { data } = await httpClient.get<{ items: Array<{
      account_id: string; code: string; name: string; account_type: string;
      total_debit: number; total_credit: number; balance: number;
    }> }>("/accounts/trial-balance", { params: { as_of: asOf } });
    return data.items.map((r) => ({
      accountId: r.account_id,
      code: r.code,
      name: r.name,
      accountType: r.account_type,
      totalDebit: r.total_debit,
      totalCredit: r.total_credit,
      balance: r.balance,
    }));
  },

  async listVendors(): Promise<AccountVendor[]> {
    const { data } = await httpClient.get<Array<{
      id: string; code: string; name: string; contact_person: string | null;
      phone: string | null; email: string | null; is_active: boolean;
    }>>("/accounts/vendors");
    return data.map((v) => ({
      id: v.id, code: v.code, name: v.name, contactPerson: v.contact_person,
      phone: v.phone, email: v.email, isActive: v.is_active,
    }));
  },

  async createVendor(payload: { code: string; name: string }): Promise<AccountVendor> {
    const { data } = await httpClient.post("/accounts/vendors", payload);
    return { id: data.id, code: data.code, name: data.name, contactPerson: data.contact_person, phone: data.phone, email: data.email, isActive: data.is_active };
  },

  async listVendorBills(): Promise<VendorBill[]> {
    const { data } = await httpClient.get<Array<Record<string, unknown>>>("/accounts/vendor-bills");
    return data.map((b) => ({
      id: b.id as string,
      billNumber: b.bill_number as string,
      vendorId: b.vendor_id as string,
      billDate: b.bill_date as string,
      dueDate: (b.due_date as string) ?? null,
      amount: b.amount as number,
      paidAmount: b.paid_amount as number,
      balance: b.balance as number,
      status: b.status as string,
      description: (b.description as string) ?? null,
    }));
  },

  async createVendorBill(payload: {
    vendorId: string;
    billDate: string;
    amount: number;
    expenseAccountId: string;
    description?: string;
  }): Promise<VendorBill> {
    const { data } = await httpClient.post("/accounts/vendor-bills", {
      vendor_id: payload.vendorId,
      bill_date: payload.billDate,
      amount: payload.amount,
      expense_account_id: payload.expenseAccountId,
      description: payload.description ?? null,
    });
    return {
      id: data.id, billNumber: data.bill_number, vendorId: data.vendor_id, billDate: data.bill_date,
      dueDate: data.due_date, amount: data.amount, paidAmount: data.paid_amount,
      balance: data.balance, status: data.status, description: data.description,
    };
  },

  async createVendorPayment(payload: {
    vendorBillId: string;
    paymentAccountId: string;
    amount: number;
    paymentDate: string;
  }): Promise<VendorPayment> {
    const { data } = await httpClient.post("/accounts/vendor-payments", {
      vendor_bill_id: payload.vendorBillId,
      payment_account_id: payload.paymentAccountId,
      amount: payload.amount,
      payment_date: payload.paymentDate,
    });
    return {
      id: data.id, paymentNumber: data.payment_number, vendorBillId: data.vendor_bill_id,
      paymentAccountId: data.payment_account_id, amount: data.amount,
      paymentDate: data.payment_date, referenceNumber: data.reference_number,
    };
  },

  async getApOutstanding(): Promise<ApOutstandingRow[]> {
    const { data } = await httpClient.get<{ items: Array<Record<string, unknown>> }>("/accounts/ap-outstanding");
    return data.items.map((r) => ({
      billId: r.bill_id as string,
      billNumber: r.bill_number as string,
      vendorName: r.vendor_name as string,
      billDate: r.bill_date as string,
      dueDate: (r.due_date as string) ?? null,
      amount: r.amount as number,
      paidAmount: r.paid_amount as number,
      balance: r.balance as number,
      status: r.status as string,
    }));
  },
};
