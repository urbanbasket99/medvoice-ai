import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { collectionsReportQueryOptions } from "../api/billingQueries";
import type { CollectionsGroupBy } from "../types/billing.types";
import { formatCurrency } from "../utils/billingUtils";

const GROUP_BY_OPTIONS: Array<{ value: CollectionsGroupBy; label: string }> = [
  { value: "doctor", label: "Doctor" },
  { value: "date", label: "Date" },
  { value: "user", label: "User" },
];

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

const BillingReportsPage = () => {
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState(monthStart());
  const [dateTo, setDateTo] = useState(today());
  const [groupBy, setGroupBy] = useState<CollectionsGroupBy>("doctor");
  const [submitted, setSubmitted] = useState({ dateFrom: monthStart(), dateTo: today(), groupBy: "doctor" as CollectionsGroupBy });

  const reportQuery = useQuery(collectionsReportQueryOptions(submitted, true));

  const rows = reportQuery.data?.rows ?? [];
  const groupLabel = useMemo(
    () => GROUP_BY_OPTIONS.find((option) => option.value === submitted.groupBy)?.label ?? "Group",
    [submitted.groupBy]
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/billing/invoices")}>
          Back to Invoices
        </Button>
      </Stack>

      <PageHeader
        title="Collection Reports"
        subtitle="Summarize billed and collected amounts by doctor, date, or user."
      />

      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" } }}>
            <TextField
              label="From"
              type="date"
              size="small"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              select
              label="Group by"
              size="small"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as CollectionsGroupBy)}
              sx={{ minWidth: 160 }}
            >
              {GROUP_BY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={() => setSubmitted({ dateFrom, dateTo, groupBy })}
            >
              Run Report
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {reportQuery.isError && (
        <ErrorBanner message="Failed to load collection report." onRetry={() => void reportQuery.refetch()} />
      )}

      <Card variant="outlined">
        <CardContent>
          {reportQuery.isFetching ? (
            <Typography variant="body2" color="text.secondary">
              Loading report…
            </Typography>
          ) : rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No collection data for the selected range.
            </Typography>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{groupLabel}</TableCell>
                    <TableCell align="right">Invoices</TableCell>
                    <TableCell align="right">Total Billed</TableCell>
                    <TableCell align="right">Total Collected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.groupKey}>
                      <TableCell>{row.groupLabel}</TableCell>
                      <TableCell align="right">{row.invoiceCount}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalBilled)}</TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(row.totalCollected)}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default BillingReportsPage;
