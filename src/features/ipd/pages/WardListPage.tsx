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
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import { ipdApi } from "../api/ipdApi";
import { ipdQueryKeys, wardsListQueryOptions } from "../api/ipdQueries";
import type { CreateWardPayload, Ward, WardType } from "../types/ipd.types";

const WARD_TYPES: WardType[] = ["general", "icu", "private", "semi_private", "step_down", "other"];

const emptyForm = (): CreateWardPayload => ({
  code: "",
  name: "",
  wardType: "general",
  floor: "",
  isActive: true,
});

const WardListPage = () => {
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:update"));
  const queryClient = useQueryClient();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ward | null>(null);
  const [form, setForm] = useState<CreateWardPayload>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = useQuery(
    wardsListQueryOptions({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    })
  );

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.wards() });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return ipdApi.updateWard(editing.id, form);
      return ipdApi.createWard(form);
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

  const openEdit = (ward: Ward) => {
    setEditing(ward);
    setForm({
      code: ward.code,
      name: ward.name,
      wardType: ward.wardType,
      floor: ward.floor ?? "",
      isActive: ward.isActive,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setFormError("Code and name are required.");
      return;
    }
    setFormError(null);
    try {
      await saveMutation.mutateAsync();
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not save ward."));
    }
  };

  const columns = useMemo<GridColDef<Ward>[]>(
    () => [
      { field: "code", headerName: "Code", width: 100 },
      { field: "name", headerName: "Name", flex: 1, minWidth: 160 },
      { field: "wardType", headerName: "Type", width: 120 },
      { field: "floor", headerName: "Floor", width: 90, valueGetter: (_, row) => row.floor ?? "—" },
      {
        field: "isActive",
        headerName: "Active",
        width: 90,
        valueGetter: (_, row) => (row.isActive ? "Yes" : "No"),
      },
      {
        field: "actions",
        headerName: "",
        width: 90,
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
        title="Wards"
        subtitle="Manage inpatient ward master data."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
              Add ward
            </Button>
          ) : undefined
        }
      />

      {listQuery.isError && <ErrorBanner message="Could not load wards." />}
      <Box sx={{ height: 480 }}>
        <DataGrid
          rows={listQuery.data?.items ?? []}
          columns={columns}
          loading={listQuery.isLoading}
          rowCount={listQuery.data?.total ?? 0}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit ward" : "Add ward"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField select label="Ward type" value={form.wardType} onChange={(e) => setForm({ ...form, wardType: e.target.value as WardType })}>
              {WARD_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t.replace("_", " ")}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Floor" value={form.floor ?? ""} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            <FormControlLabel
              control={<Checkbox checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saveMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default WardListPage;
