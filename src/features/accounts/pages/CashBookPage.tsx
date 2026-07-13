import { useState } from "react";
import { Box, Button, Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { cashBookQueryOptions } from "../api/accountsQueries";

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

const CashBookPage = () => {
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(today());
  const [submitted, setSubmitted] = useState({ from: monthStart(), to: today() });
  const reportQuery = useQuery(cashBookQueryOptions(submitted.from, submitted.to, true));

  return (
    <Stack spacing={3}>
      <PageHeader title="Cash Book" subtitle="Cash and bank movements from the general ledger." />
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <TextField type="date" size="small" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField type="date" size="small" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <Button variant="contained" onClick={() => setSubmitted({ from: dateFrom, to: dateTo })}>Run report</Button>
          </Stack>
        </CardContent>
      </Card>
      {reportQuery.isError && <ErrorBanner message="Could not load cash book." />}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Entry #</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Debit</TableCell>
              <TableCell align="right">Credit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(reportQuery.data ?? []).map((row, i) => (
              <TableRow key={`${row.entryNumber}-${i}`}>
                <TableCell>{row.entryDate}</TableCell>
                <TableCell>{row.entryNumber}</TableCell>
                <TableCell>{row.accountCode} {row.accountName}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell align="right">{Number(row.debit).toFixed(2)}</TableCell>
                <TableCell align="right">{Number(row.credit).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
};

export default CashBookPage;
