import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { billingApi } from "../api/billingApi";
import { billingQueryKeys, invoiceClaimsQueryOptions, tpasListQueryOptions } from "../api/billingQueries";
import type { ClaimStatus, InsuranceClaim } from "../types/billing.types";
import { formatCurrency, formatDisplayDateTime } from "../utils/billingUtils";

const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

interface InvoiceClaimsSectionProps {
  invoiceId: string;
  canUpdate: boolean;
  defaultTpaId?: string | null;
}

const InvoiceClaimsSection = ({ invoiceId, canUpdate, defaultTpaId }: InvoiceClaimsSectionProps) => {
  const queryClient = useQueryClient();
  const claimsQuery = useQuery(invoiceClaimsQueryOptions(invoiceId));
  const tpasQuery = useQuery(tpasListQueryOptions({ page: 1, pageSize: 100, isActive: true }));

  const [insurerName, setInsurerName] = useState("");
  const [claimNumber, setClaimNumber] = useState("");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [tpaId, setTpaId] = useState(defaultTpaId ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: billingQueryKeys.claims(invoiceId) });
    void queryClient.invalidateQueries({ queryKey: billingQueryKeys.detail(invoiceId) });
  };

  const createClaim = useMutation({
    mutationFn: () =>
      billingApi.createClaim(invoiceId, {
        insurerName: insurerName || null,
        claimNumber: claimNumber || null,
        claimedAmount: claimedAmount || null,
        notes: notes || null,
        tpaId: tpaId || null,
      }),
    onSuccess: () => {
      setInsurerName("");
      setClaimNumber("");
      setClaimedAmount("");
      setNotes("");
      setFormError(null);
      invalidate();
    },
  });

  const updateClaim = useMutation({
    mutationFn: ({ claimId, status }: { claimId: string; status: ClaimStatus }) =>
      billingApi.updateClaim(claimId, {
        status,
        submittedAt: status === "submitted" ? new Date().toISOString() : undefined,
      }),
    onSuccess: invalidate,
  });

  const claims = claimsQuery.data ?? [];
  const tpas = tpasQuery.data?.items ?? [];

  const handleCreate = async () => {
    setFormError(null);
    try {
      await createClaim.mutateAsync();
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not create claim."));
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader title="Insurance Claims" />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          {claimsQuery.isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void claimsQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load claims.
            </Alert>
          )}

          {claims.length === 0 && !claimsQuery.isLoading ? (
            <Typography variant="body2" color="text.secondary">
              No insurance claims yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Claim #</TableCell>
                  <TableCell>Insurer</TableCell>
                  <TableCell align="right">Claimed</TableCell>
                  <TableCell align="right">Approved</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  {canUpdate && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim: InsuranceClaim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.claimNumber ?? "—"}</TableCell>
                    <TableCell>{claim.insurerName ?? "—"}</TableCell>
                    <TableCell align="right">{formatCurrency(claim.claimedAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(claim.approvedAmount)}</TableCell>
                    <TableCell>{CLAIM_STATUS_LABELS[claim.status] ?? claim.status}</TableCell>
                    <TableCell>{formatDisplayDateTime(claim.updatedAt)}</TableCell>
                    {canUpdate && (
                      <TableCell align="right">
                        <TextField
                          select
                          size="small"
                          value={claim.status}
                          disabled={updateClaim.isPending}
                          onChange={(event) =>
                            void updateClaim.mutateAsync({
                              claimId: claim.id,
                              status: event.target.value as ClaimStatus,
                            })
                          }
                          sx={{ minWidth: 140 }}
                        >
                          {(Object.keys(CLAIM_STATUS_LABELS) as ClaimStatus[]).map((status) => (
                            <MenuItem key={status} value={status}>
                              {CLAIM_STATUS_LABELS[status]}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {canUpdate && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Add claim
              </Typography>
              {formError && <Alert severity="error" sx={{ mb: 1.5 }}>{formError}</Alert>}
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    label="Insurer name"
                    size="small"
                    fullWidth
                    value={insurerName}
                    onChange={(event) => setInsurerName(event.target.value)}
                  />
                  <TextField
                    label="Claim number"
                    size="small"
                    fullWidth
                    value={claimNumber}
                    onChange={(event) => setClaimNumber(event.target.value)}
                  />
                  <TextField
                    label="Claimed amount"
                    size="small"
                    fullWidth
                    value={claimedAmount}
                    onChange={(event) => setClaimedAmount(event.target.value)}
                  />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    select
                    label="TPA"
                    size="small"
                    fullWidth
                    value={tpaId}
                    onChange={(event) => setTpaId(event.target.value)}
                  >
                    <MenuItem value="">None</MenuItem>
                    {tpas.map((tpa) => (
                      <MenuItem key={tpa.id} value={tpa.id}>
                        {tpa.code} — {tpa.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Notes"
                    size="small"
                    fullWidth
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </Stack>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    disabled={createClaim.isPending}
                    startIcon={createClaim.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
                    onClick={() => void handleCreate()}
                  >
                    Add Claim
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default InvoiceClaimsSection;
