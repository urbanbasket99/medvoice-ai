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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import { billingApi } from "../api/billingApi";
import { billingQueryKeys, tpasListQueryOptions } from "../api/billingQueries";
import type { CreateTpaPayload, Tpa } from "../types/billing.types";

const emptyForm = (): CreateTpaPayload => ({
  code: "",
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
});

const TpaListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("billing:delete"));
  const queryClient = useQueryClient();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tpa | null>(null);
  const [form, setForm] = useState<CreateTpaPayload>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery(
    tpasListQueryOptions({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    })
  );

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: billingQueryKeys.tpas() });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return billingApi.updateTpa(editing.id, form);
      return billingApi.createTpa(form);
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm());
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billingApi.removeTpa(id),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (tpa: Tpa) => {
    setEditing(tpa);
    setForm({
      code: tpa.code,
      name: tpa.name,
      contactPerson: tpa.contactPerson ?? "",
      phone: tpa.phone ?? "",
      email: tpa.email ?? "",
      address: tpa.address ?? "",
      isActive: tpa.isActive,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save TPA."));
    }
  };

  const columns = useMemo<GridColDef<Tpa>[]>(
    () => [
      { field: "code", headerName: "Code", flex: 0.6, minWidth: 100 },
      { field: "name", headerName: "Name", flex: 1.2, minWidth: 160 },
      { field: "contactPerson", headerName: "Contact", flex: 1, minWidth: 140, valueGetter: (_, row) => row.contactPerson ?? "—" },
      { field: "phone", headerName: "Phone", flex: 0.8, minWidth: 120, valueGetter: (_, row) => row.phone ?? "—" },
      {
        field: "isActive",
        headerName: "Active",
        width: 90,
        valueGetter: (_, row) => (row.isActive ? "Yes" : "No"),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            {canUpdate && (
              <Button size="small" onClick={() => openEdit(params.row)}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button size="small" color="error" onClick={() => void deleteMutation.mutateAsync(params.row.id)}>
                Delete
              </Button>
            )}
          </Stack>
        ),
      },
    ],
    [canUpdate, canDelete, deleteMutation]
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/billing/invoices")}>
          Back to Invoices
        </Button>
      </Stack>

      <PageHeader
        title="TPAs"
        subtitle="Manage third-party administrators for insurance billing."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
              Add TPA
            </Button>
          ) : undefined
        }
      />

      {listQuery.isError && (
        <ErrorBanner message="Failed to load TPAs." onRetry={() => void listQuery.refetch()} />
      )}

      <Box sx={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={listQuery.data?.items ?? []}
          columns={columns}
          rowCount={listQuery.data?.total ?? 0}
          loading={listQuery.isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit TPA" : "Add TPA"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Code"
              size="small"
              fullWidth
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            />
            <TextField
              label="Name"
              size="small"
              fullWidth
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <TextField
              label="Contact person"
              size="small"
              fullWidth
              value={form.contactPerson ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPerson: event.target.value }))}
            />
            <TextField
              label="Phone"
              size="small"
              fullWidth
              value={form.phone ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <TextField
              label="Email"
              size="small"
              fullWidth
              value={form.email ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <TextField
              label="Address"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={form.address ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive ?? true}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={saveMutation.isPending} onClick={() => void handleSave()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default TpaListPage;
