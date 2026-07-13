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
  apOutstandingQueryOptions,
  chartOfAccountsQueryOptions,
  vendorBillsQueryOptions,
  vendorsQueryOptions,
} from "../api/accountsQueries";
import type { ApOutstandingRow, VendorBill } from "../types/accounts.types";

const today = () => new Date().toISOString().slice(0, 10);

const AccountsPayablePage = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const vendorsQuery = useQuery(vendorsQueryOptions());
  const billsQuery = useQuery(vendorBillsQueryOptions());
  const outstandingQuery = useQuery(apOutstandingQueryOptions());
  const accountsQuery = useQuery(chartOfAccountsQueryOptions());

  const expenseAccounts = (accountsQuery.data ?? []).filter((a) => a.accountType === "expense");
  const assetAccounts = (accountsQuery.data ?? []).filter((a) => a.accountType === "asset");

  const [vendorForm, setVendorForm] = useState({ code: "", name: "" });
  const [billForm, setBillForm] = useState({
    vendorId: "", billDate: today(), amount: "", expenseAccountId: "", description: "",
  });
  const [payForm, setPayForm] = useState({
    vendorBillId: "", paymentAccountId: "", amount: "", paymentDate: today(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: accountsQueryKeys.vendors() });
    void queryClient.invalidateQueries({ queryKey: accountsQueryKeys.vendorBills() });
    void queryClient.invalidateQueries({ queryKey: accountsQueryKeys.apOutstanding() });
  };

  const vendorMutation = useMutation({
    mutationFn: () => accountsApi.createVendor(vendorForm),
    onSuccess: () => { setVendorForm({ code: "", name: "" }); invalidate(); },
  });
  const billMutation = useMutation({
    mutationFn: () =>
      accountsApi.createVendorBill({
        vendorId: billForm.vendorId,
        billDate: billForm.billDate,
        amount: Number(billForm.amount),
        expenseAccountId: billForm.expenseAccountId,
        description: billForm.description,
      }),
    onSuccess: () => invalidate(),
  });
  const payMutation = useMutation({
    mutationFn: () =>
      accountsApi.createVendorPayment({
        vendorBillId: payForm.vendorBillId,
        paymentAccountId: payForm.paymentAccountId,
        amount: Number(payForm.amount),
        paymentDate: payForm.paymentDate,
      }),
    onSuccess: () => invalidate(),
  });

  const billCols: GridColDef<VendorBill>[] = [
    { field: "billNumber", headerName: "Bill #", width: 110 },
    { field: "billDate", headerName: "Date", width: 110 },
    { field: "amount", headerName: "Amount", width: 100 },
    { field: "balance", headerName: "Balance", width: 100 },
    { field: "status", headerName: "Status", width: 100 },
  ];

  const outstandingCols: GridColDef<ApOutstandingRow>[] = [
    { field: "billNumber", headerName: "Bill #", width: 110 },
    { field: "vendorName", headerName: "Vendor", flex: 1, minWidth: 140 },
    { field: "dueDate", headerName: "Due", width: 110, valueGetter: (_, r) => r.dueDate ?? "—" },
    { field: "balance", headerName: "Outstanding", width: 110 },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader title="Accounts Payable" subtitle="Vendors, bills, payments, and outstanding balances." />
      <Card variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Vendors" />
          <Tab label="Bills" />
          <Tab label="Pay bill" />
          <Tab label="Outstanding" />
        </Tabs>
        <CardContent>
          {tab === 0 && (
            <Stack spacing={1.5} direction={{ xs: "column", md: "row" }}>
              <TextField size="small" label="Code" value={vendorForm.code} onChange={(e) => setVendorForm({ ...vendorForm, code: e.target.value })} />
              <TextField size="small" label="Name" value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} sx={{ flex: 1 }} />
              <Button variant="contained" onClick={() => void vendorMutation.mutateAsync()}>Add vendor</Button>
              <Typography variant="body2" sx={{ alignSelf: "center" }}>{(vendorsQuery.data ?? []).length} vendors</Typography>
            </Stack>
          )}
          {tab === 1 && (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
                <TextField select size="small" label="Vendor" value={billForm.vendorId} onChange={(e) => setBillForm({ ...billForm, vendorId: e.target.value })} sx={{ minWidth: 180 }}>
                  {(vendorsQuery.data ?? []).map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
                </TextField>
                <TextField type="date" size="small" label="Bill date" value={billForm.billDate} onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField select size="small" label="Expense account" value={billForm.expenseAccountId} onChange={(e) => setBillForm({ ...billForm, expenseAccountId: e.target.value })} sx={{ minWidth: 180 }}>
                  {expenseAccounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Amount" type="number" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} />
                <Button variant="contained" onClick={() => void billMutation.mutateAsync()}>Create bill</Button>
              </Stack>
              <Box sx={{ height: 280 }}>
                <DataGrid rows={billsQuery.data ?? []} columns={billCols} getRowId={(r) => r.id} disableRowSelectionOnClick />
              </Box>
            </Stack>
          )}
          {tab === 2 && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap">
              <TextField select size="small" label="Bill" value={payForm.vendorBillId} onChange={(e) => setPayForm({ ...payForm, vendorBillId: e.target.value })} sx={{ minWidth: 200 }}>
                {(billsQuery.data ?? []).filter((b) => b.balance > 0).map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.billNumber} — {b.balance}</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Pay from" value={payForm.paymentAccountId} onChange={(e) => setPayForm({ ...payForm, paymentAccountId: e.target.value })} sx={{ minWidth: 180 }}>
                {assetAccounts.map((a) => <MenuItem key={a.id} value={a.id}>{a.code}</MenuItem>)}
              </TextField>
              <TextField size="small" label="Amount" type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
              <TextField type="date" size="small" label="Payment date" value={payForm.paymentDate} onChange={(e) => setPayForm({ ...payForm, paymentDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              <Button variant="contained" onClick={() => void payMutation.mutateAsync()}>Record payment</Button>
            </Stack>
          )}
          {tab === 3 && (
            <Box sx={{ height: 320 }}>
              <DataGrid rows={outstandingQuery.data ?? []} columns={outstandingCols} getRowId={(r) => r.billId} disableRowSelectionOnClick />
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default AccountsPayablePage;
