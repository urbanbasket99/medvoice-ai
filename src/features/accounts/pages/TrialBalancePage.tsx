import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { trialBalanceQueryOptions } from "../api/accountsQueries";

const today = () => new Date().toISOString().slice(0, 10);

const TrialBalancePage = () => {
  const [asOf, setAsOf] = useState(today());
  const [submitted, setSubmitted] = useState(today());
  const reportQuery = useQuery(trialBalanceQueryOptions(submitted, true));

  return (
    <Stack spacing={3}>
      <PageHeader title="Trial Balance" subtitle="Debit and credit totals by GL account." />
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1.5}>
            <TextField type="date" size="small" label="As of" value={asOf} onChange={(e) => setAsOf(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Button variant="contained" onClick={() => setSubmitted(asOf)}>Generate</Button>
          </Stack>
        </CardContent>
      </Card>
      {reportQuery.isError && <ErrorBanner message="Could not load trial balance." />}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Debit</TableCell>
              <TableCell align="right">Credit</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(reportQuery.data ?? []).map((row) => (
              <TableRow key={row.accountId}>
                <TableCell>{row.code}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.accountType}</TableCell>
                <TableCell align="right">{Number(row.totalDebit).toFixed(2)}</TableCell>
                <TableCell align="right">{Number(row.totalCredit).toFixed(2)}</TableCell>
                <TableCell align="right">{Number(row.balance).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
};

export default TrialBalancePage;
