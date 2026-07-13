import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import { useSuppliers } from "../hooks/useSuppliers";
import type { CreateSupplierPayload, PharmacySupplier } from "../types/pharmacy.types";

const emptyForm = (): CreateSupplierPayload => ({
  name: "",
  code: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
});

const SupplierListPage = () => {
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:update"));
  const queryClient = useQueryClient();
  const listQuery = useSuppliers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PharmacySupplier | null>(null);
  const [form, setForm] = useState<CreateSupplierPayload>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.suppliers() });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return pharmacyApi.updateSupplier(editing.id, { ...form, name: form.name });
      return pharmacyApi.createSupplier(form);
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm());
      invalidate();
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (supplier: PharmacySupplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      code: supplier.code ?? "",
      contactPerson: supplier.contactPerson ?? "",
      phone: supplier.phone ?? "",
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      isActive: supplier.isActive,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Supplier name is required.");
      return;
    }
    setFormError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save supplier."));
    }
  };

  const columns = useMemo<GridColDef<PharmacySupplier>[]>(
    () => [
      { field: "code", headerName: "Code", flex: 0.7, minWidth: 90, valueGetter: (_, row) => row.code ?? "—" },
      { field: "name", headerName: "Name", flex: 1.2, minWidth: 160 },
      { field: "phone", headerName: "Phone", flex: 0.8, minWidth: 120, valueGetter: (_, row) => row.phone ?? "—" },
      { field: "email", headerName: "Email", flex: 1, minWidth: 160, valueGetter: (_, row) => row.email ?? "—" },
      {
        field: "isActive",
        headerName: "Active",
        width: 90,
        valueGetter: (_, row) => (row.isActive ? "Yes" : "No"),
      },
      {
        field: "actions",
        headerName: "",
        width: 100,
        sortable: false,
        renderCell: ({ row }) =>
          canUpdate ? (
            <Button size="small" onClick={() => openEdit(row)}>
              Edit
            </Button>
          ) : null,
      },
    ],
    [canUpdate]
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Suppliers"
        subtitle="Manage pharmacy vendor and supplier master data."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
              Add supplier
            </Button>
          ) : undefined
        }
      />

      {listQuery.isError && <ErrorBanner message="Could not load suppliers." />}
      <Box sx={{ height: 480 }}>
        <DataGrid
          rows={listQuery.data?.items ?? []}
          columns={columns}
          loading={listQuery.isLoading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit supplier" : "Add supplier"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Code" value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <TextField label="Contact person" value={form.contactPerson ?? ""} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <TextField label="Phone" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Address" multiline minRows={2} value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <FormControlLabel
              control={<Checkbox checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label="Active"
            />
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

export default SupplierListPage;
