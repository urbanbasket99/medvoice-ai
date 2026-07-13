import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import { useSuppliers } from "../hooks/useSuppliers";
import type { CreateVendorPaymentPayload, VendorPayment, VendorPaymentMethod } from "../types/pharmacy.types";

const PAYMENT_METHODS: VendorPaymentMethod[] = ["cash", "cheque", "bank_transfer", "upi", "card", "other"];

const emptyForm = (): CreateVendorPaymentPayload => ({
  supplierId: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  referenceNumber: "",
  notes: "",
});

const VendorPaymentsPage = () => {
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const queryClient = useQueryClient();
  const suppliersQuery = useSuppliers();
  const paymentsQuery = useQuery({
    queryKey: [...pharmacyQueryKeys.all, "vendor-payments"],
    queryFn: () => pharmacyApi.listVendorPayments(),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateVendorPaymentPayload>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () => pharmacyApi.createVendorPayment(form),
    onSuccess: () => {
      setDialogOpen(false);
      setForm(emptyForm());
      void queryClient.invalidateQueries({ queryKey: [...pharmacyQueryKeys.all, "vendor-payments"] });
    },
  });

  const columns = useMemo<GridColDef<VendorPayment>[]>(
    () => [
      { field: "paymentNumber", headerName: "Payment #", flex: 0.8, minWidth: 120 },
      { field: "supplierName", headerName: "Supplier", flex: 1, minWidth: 140, valueGetter: (_, row) => row.supplierName ?? "—" },
      { field: "amount", headerName: "Amount", flex: 0.6, minWidth: 100 },
      { field: "paymentDate", headerName: "Date", flex: 0.7, minWidth: 110 },
      { field: "paymentMethod", headerName: "Method", flex: 0.7, minWidth: 110 },
      { field: "referenceNumber", headerName: "Reference", flex: 0.8, minWidth: 120, valueGetter: (_, row) => row.referenceNumber ?? "—" },
    ],
    []
  );

  const handleSave = async () => {
    if (!form.supplierId || !form.amount.trim()) {
      setFormError("Supplier and amount are required.");
      return;
    }
    setFormError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not record payment."));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Vendor payments"
        subtitle="Record payments made to pharmacy suppliers."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)}>
              Record payment
            </Button>
          ) : undefined
        }
      />

      {paymentsQuery.isError && <ErrorBanner message="Could not load vendor payments." />}
      <Box sx={{ height: 480 }}>
        <DataGrid
          rows={paymentsQuery.data?.items ?? []}
          columns={columns}
          loading={paymentsQuery.isLoading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record vendor payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select
              label="Supplier"
              required
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            >
              {(suppliersQuery.data?.items ?? []).map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Amount" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <TextField type="date" label="Payment date" InputLabelProps={{ shrink: true }} value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
            <TextField select label="Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as VendorPaymentMethod })}>
              {PAYMENT_METHODS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m.replace("_", " ")}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Reference number" value={form.referenceNumber ?? ""} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} />
            <TextField label="Notes" multiline minRows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saveMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default VendorPaymentsPage;
