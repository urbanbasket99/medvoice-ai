import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { bedsListQueryOptions, ipdQueryKeys, wardsListQueryOptions } from "../api/ipdQueries";
import type { Bed, BedStatus, CreateBedPayload } from "../types/ipd.types";

const BED_STATUS_COLOR: Record<BedStatus, "default" | "success" | "warning"> = {
  available: "success",
  occupied: "warning",
  maintenance: "default",
};

const emptyForm = (): CreateBedPayload => ({
  wardId: "",
  bedNumber: "",
  status: "available",
});

const BedBoardPage = () => {
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:create"));
  const queryClient = useQueryClient();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [selectedWardId, setSelectedWardId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateBedPayload>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);

  const wardsQuery = useQuery(wardsListQueryOptions({ page: 1, pageSize: 200, isActive: true }));
  const bedsQuery = useQuery(
    bedsListQueryOptions({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      wardId: selectedWardId || undefined,
    })
  );

  const createMutation = useMutation({
    mutationFn: (payload: CreateBedPayload) => ipdApi.createBed(payload),
    onSuccess: () => {
      setDialogOpen(false);
      setForm(emptyForm());
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.beds() });
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.wards() });
    },
  });

  const handleOpenCreate = () => {
    setForm({
      ...emptyForm(),
      wardId: selectedWardId || form.wardId,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!form.wardId || !form.bedNumber.trim()) {
      setFormError("Ward and bed number are required.");
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync(form);
    } catch (error) {
      setFormError(extractApiErrorMessage(error, "Could not create bed."));
    }
  };

  const columns = useMemo<GridColDef<Bed>[]>(
    () => [
      { field: "wardName", headerName: "Ward", flex: 1, minWidth: 140, valueGetter: (_, row) => row.wardName ?? "—" },
      { field: "bedNumber", headerName: "Bed", flex: 0.8, minWidth: 100 },
      { field: "wardType", headerName: "Ward type", flex: 0.8, minWidth: 120, valueGetter: (_, row) => row.wardType ?? "—" },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params) => (
          <Chip
            label={params.row.status.replace("_", " ").toUpperCase()}
            size="small"
            color={BED_STATUS_COLOR[params.row.status]}
          />
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="IPD Bed Board"
        subtitle="Track bed occupancy by ward."
        actions={
          <>
            <TextField
              select
              size="small"
              label="Ward"
              value={selectedWardId}
              onChange={(event) => {
                setSelectedWardId(event.target.value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">All wards</MenuItem>
              {(wardsQuery.data?.items ?? []).map((ward) => (
                <MenuItem key={ward.id} value={ward.id}>
                  {ward.name}
                </MenuItem>
              ))}
            </TextField>
            {canCreate ? (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate}>
                Add bed
              </Button>
            ) : null}
          </>
        }
      />

      {bedsQuery.isError && <ErrorBanner message="Failed to load beds." onRetry={() => void bedsQuery.refetch()} />}

      <Box sx={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={bedsQuery.data?.items ?? []}
          columns={columns}
          rowCount={bedsQuery.data?.total ?? 0}
          loading={bedsQuery.isFetching || wardsQuery.isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add bed</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select
              label="Ward"
              size="small"
              fullWidth
              required
              value={form.wardId}
              onChange={(event) => setForm((prev) => ({ ...prev, wardId: event.target.value }))}
            >
              {(wardsQuery.data?.items ?? []).map((ward) => (
                <MenuItem key={ward.id} value={ward.id}>
                  {ward.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Bed number"
              size="small"
              fullWidth
              required
              value={form.bedNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, bedNumber: event.target.value }))}
            />
            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={form.status ?? "available"}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as BedStatus }))
              }
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={createMutation.isPending} onClick={() => void handleCreate()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default BedBoardPage;
