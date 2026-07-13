import { useState } from "react";
import { Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "../../../components/ui";
import { accountsApi } from "../api/accountsApi";
import { accountsQueryKeys, chartOfAccountsQueryOptions } from "../api/accountsQueries";
import type { Account, AccountType } from "../types/accounts.types";

const ACCOUNT_TYPES: AccountType[] = ["asset", "liability", "equity", "income", "expense"];

const ChartOfAccountsPage = () => {
  const queryClient = useQueryClient();
  const listQuery = useQuery(chartOfAccountsQueryOptions());
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("expense");

  const createMutation = useMutation({
    mutationFn: () => accountsApi.createAccount({ code, name, accountType }),
    onSuccess: () => {
      setCode("");
      setName("");
      void queryClient.invalidateQueries({ queryKey: accountsQueryKeys.chart() });
    },
  });

  const columns: GridColDef<Account>[] = [
    { field: "code", headerName: "Code", width: 100 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
    { field: "accountType", headerName: "Type", width: 110 },
    { field: "isActive", headerName: "Active", width: 90, valueGetter: (_, row) => (row.isActive ? "Yes" : "No") },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader title="Chart of Accounts" subtitle="General ledger account master." />
      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField size="small" label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} />
            <TextField select size="small" label="Type" value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} sx={{ minWidth: 140 }}>
              {ACCOUNT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <Button variant="contained" disabled={createMutation.isPending} onClick={() => void createMutation.mutateAsync()}>Add account</Button>
          </Stack>
        </CardContent>
      </Card>
      <Box sx={{ height: 420 }}>
        <DataGrid rows={listQuery.data ?? []} columns={columns} loading={listQuery.isLoading} getRowId={(r) => r.id} disableRowSelectionOnClick />
      </Box>
      <Typography variant="caption" color="text.secondary">
        Default COA (1000 Cash, 1100 Bank, 2000 AP, 4000 Revenue, 5000+ Expenses) is seeded on `python -m app.db.seed`.
      </Typography>
    </Stack>
  );
};

export default ChartOfAccountsPage;
