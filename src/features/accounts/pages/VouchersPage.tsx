import { useState } from "react";
import {
  Box, Button, Card, CardContent, MenuItem, Stack, Tab, Tabs, TextField, Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "../../../components/ui";
import { accountsApi } from "../api/accountsApi";
import {
  accountsQueryKeys,
  chartOfAccountsQueryOptions,
  expenseVouchersQueryOptions,
  incomeVouchersQueryOptions,
} from "../api/accountsQueries";
import type { ExpenseVoucher, IncomeVoucher } from "../types/accounts.types";

const today = () => new Date().toISOString().slice(0, 10);

const VouchersPage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const accountsQuery = useQuery(chartOfAccountsQueryOptions());
  const expensesQuery = useQuery(expenseVouchersQueryOptions());
  const incomeQuery = useQuery(incomeVouchersQueryOptions());

  const assetAccounts = (accountsQuery.data ?? []).filter((a) => a.accountType === "asset");
  const expenseAccounts = (accountsQuery.data ?? []).filter((a) => a.accountType === "expense");
  const incomeAccounts = (accountsQuery.data ?? []).filter((a) => a.accountType === "income");

  const [expenseForm, setExpenseForm] = useState({
    voucherDate: today(), expenseAccountId: "", paymentAccountId: "", amount: "", description: "",
  });
  const [incomeForm, setIncomeForm] = useState({
    voucherDate: today(), incomeAccountId: "", receiptAccountId: "", amount: "", description: "",
  });

  const expenseMutation = useMutation({
    mutationFn: () =>
      accountsApi.createExpenseVoucher({
        voucherDate: expenseForm.voucherDate,
        expenseAccountId: expenseForm.expenseAccountId,
        paymentAccountId: expenseForm.paymentAccountId,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountsQueryKeys.expenses() }),
  });

  const incomeMutation = useMutation({
    mutationFn: () =>
      accountsApi.createIncomeVoucher({
        voucherDate: incomeForm.voucherDate,
        incomeAccountId: incomeForm.incomeAccountId,
        receiptAccountId: incomeForm.receiptAccountId,
        amount: Number(incomeForm.amount),
        description: incomeForm.description,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: accountsQueryKeys.income() }),
  });

  const expenseCols: GridColDef<ExpenseVoucher>[] = [
    { field: "voucherNumber", headerName: "Voucher #", width: 120 },
    { field: "voucherDate", headerName: "Date", width: 110 },
    { field: "amount", headerName: "Amount", width: 100 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 160 },
  ];

  const incomeCols: GridColDef<IncomeVoucher>[] = [
    { field: "voucherNumber", headerName: "Voucher #", width: 120 },
    { field: "voucherDate", headerName: "Date", width: 110 },
    { field: "amount", headerName: "Amount", width: 100 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 160 },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader title="Income & Expense Vouchers" subtitle="Record non-patient income and operating expenses." />
      <Card variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Expenses" />
          <Tab label="Income" />
        </Tabs>
        <CardContent>
          {tab === 0 ? (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
                <TextField type="date" size="small" label="Date" value={expenseForm.voucherDate} onChange={(e) => setExpenseForm({ ...expenseForm, voucherDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField select size="small" label="Expense account" value={expenseForm.expenseAccountId} onChange={(e) => setExpenseForm({ ...expenseForm, expenseAccountId: e.target.value })} sx={{ minWidth: 200 }}>
                  {expenseAccounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Paid from" value={expenseForm.paymentAccountId} onChange={(e) => setExpenseForm({ ...expenseForm, paymentAccountId: e.target.value })} sx={{ minWidth: 200 }}>
                  {assetAccounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                <TextField size="small" label="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} sx={{ flex: 1, minWidth: 160 }} />
                <Button variant="contained" onClick={() => void expenseMutation.mutateAsync()}>Post expense</Button>
              </Stack>
              <Box sx={{ height: 300 }}>
                <DataGrid rows={expensesQuery.data ?? []} columns={expenseCols} loading={expensesQuery.isLoading} getRowId={(r) => r.id} disableRowSelectionOnClick />
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
                <TextField type="date" size="small" label="Date" value={incomeForm.voucherDate} onChange={(e) => setIncomeForm({ ...incomeForm, voucherDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField select size="small" label="Income account" value={incomeForm.incomeAccountId} onChange={(e) => setIncomeForm({ ...incomeForm, incomeAccountId: e.target.value })} sx={{ minWidth: 200 }}>
                  {incomeAccounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Received in" value={incomeForm.receiptAccountId} onChange={(e) => setIncomeForm({ ...incomeForm, receiptAccountId: e.target.value })} sx={{ minWidth: 200 }}>
                  {assetAccounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Amount" type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
                <TextField size="small" label="Description" value={incomeForm.description} onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} sx={{ flex: 1, minWidth: 160 }} />
                <Button variant="contained" onClick={() => void incomeMutation.mutateAsync()}>Post income</Button>
              </Stack>
              <Box sx={{ height: 300 }}>
                <DataGrid rows={incomeQuery.data ?? []} columns={incomeCols} loading={incomeQuery.isLoading} getRowId={(r) => r.id} disableRowSelectionOnClick />
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
      <Typography variant="caption" color="text.secondary">Each voucher auto-posts a balanced journal entry to the GL.</Typography>
    </Stack>
  );
};

export default VouchersPage;
