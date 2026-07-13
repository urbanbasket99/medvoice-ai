import { queryOptions } from "@tanstack/react-query";
import { accountsApi } from "./accountsApi";

export const accountsQueryKeys = {
  all: ["accounts"] as const,
  chart: () => [...accountsQueryKeys.all, "chart"] as const,
  expenses: () => [...accountsQueryKeys.all, "expenses"] as const,
  income: () => [...accountsQueryKeys.all, "income"] as const,
  cashBook: (from: string, to: string) => [...accountsQueryKeys.all, "cash-book", from, to] as const,
  trialBalance: (asOf: string) => [...accountsQueryKeys.all, "trial-balance", asOf] as const,
  vendors: () => [...accountsQueryKeys.all, "vendors"] as const,
  vendorBills: () => [...accountsQueryKeys.all, "vendor-bills"] as const,
  apOutstanding: () => [...accountsQueryKeys.all, "ap-outstanding"] as const,
};

export const chartOfAccountsQueryOptions = () =>
  queryOptions({ queryKey: accountsQueryKeys.chart(), queryFn: () => accountsApi.listAccounts() });

export const expenseVouchersQueryOptions = () =>
  queryOptions({ queryKey: accountsQueryKeys.expenses(), queryFn: () => accountsApi.listExpenseVouchers() });

export const incomeVouchersQueryOptions = () =>
  queryOptions({ queryKey: accountsQueryKeys.income(), queryFn: () => accountsApi.listIncomeVouchers() });

export const cashBookQueryOptions = (dateFrom: string, dateTo: string, enabled = true) =>
  queryOptions({
    queryKey: accountsQueryKeys.cashBook(dateFrom, dateTo),
    queryFn: () => accountsApi.getCashBook(dateFrom, dateTo),
    enabled,
  });

export const trialBalanceQueryOptions = (asOf: string, enabled = true) =>
  queryOptions({
    queryKey: accountsQueryKeys.trialBalance(asOf),
    queryFn: () => accountsApi.getTrialBalance(asOf),
    enabled,
  });

export const vendorsQueryOptions = () =>
  queryOptions({ queryKey: accountsQueryKeys.vendors(), queryFn: () => accountsApi.listVendors() });

export const vendorBillsQueryOptions = () =>
  queryOptions({ queryKey: accountsQueryKeys.vendorBills(), queryFn: () => accountsApi.listVendorBills() });

export const apOutstandingQueryOptions = () =>
  queryOptions({ queryKey: accountsQueryKeys.apOutstanding(), queryFn: () => accountsApi.getApOutstanding() });
