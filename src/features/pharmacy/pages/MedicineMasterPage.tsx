import { useMemo, useState } from "react";
import { Box, Button, Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useNavigate } from "react-router-dom";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import MedicineForm from "../components/MedicineForm";
import { MedicineDeleteDialog } from "../components/PharmacyDeleteDialog";
import PharmacySnackbar from "../components/PharmacySnackbar";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useCreateMedicine, useDeleteMedicine, useUpdateMedicine } from "../hooks/useMedicineMutations";
import { useMedicineSearch, useMedicines } from "../hooks/useMedicines";
import { usePharmacySnackbar } from "../hooks/usePharmacySnackbar";
import type { MedicineFormValues } from "../schemas/pharmacySchema";
import type { PharmacyMedicine } from "../types/pharmacy.types";
import {
  CATEGORY_LABELS,
  formatDisplayDate,
  formatPrice,
  toCreateMedicinePayload,
  toMedicineFormValues,
  toUpdateMedicinePayload,
} from "../utils/pharmacyUtils";

const MedicineMasterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:delete"));

  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<PharmacyMedicine | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PharmacyMedicine | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { snackbar, showSuccess, showError, closeSnackbar } = usePharmacySnackbar();
  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const catalogQuery = useMedicines({ page: paginationModel.page + 1, pageSize: paginationModel.pageSize });
  const searchResult = useMedicineSearch(isSearching ? searchQuery : "");
  const activeQuery = isSearching ? searchResult : catalogQuery;

  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const deleteMedicine = useDeleteMedicine();

  const rows = useMemo(() => {
    if (isSearching) return searchResult.data?.items ?? [];
    return catalogQuery.data?.items ?? [];
  }, [catalogQuery.data?.items, isSearching, searchResult.data?.items]);

  const rowCount = isSearching ? rows.length : (catalogQuery.data?.total ?? 0);

  const columns = useMemo<GridColDef<PharmacyMedicine>[]>(() => {
    const base: GridColDef<PharmacyMedicine>[] = [
      { field: "medicineCode", headerName: "Code", width: 120 },
      { field: "brandName", headerName: "Brand", flex: 1, minWidth: 160 },
      { field: "genericName", headerName: "Generic", width: 160 },
      {
        field: "category",
        headerName: "Category",
        width: 110,
        valueGetter: (_, row) => CATEGORY_LABELS[row.category] ?? row.category,
      },
      { field: "strength", headerName: "Strength", width: 100 },
      {
        field: "sellingPrice",
        headerName: "Price",
        width: 110,
        valueFormatter: (value: string | null) => formatPrice(value),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 100,
        renderCell: (params) => (
          <Chip size="small" label={params.row.isActive ? "Active" : "Inactive"} color={params.row.isActive ? "success" : "default"} />
        ),
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
      },
    ];

    if (canUpdate || canDelete) {
      base.push({
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 100,
        getActions: (params) => {
          const actions = [];
          if (canUpdate) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditRoundedIcon />}
                label="Edit"
                onClick={() => {
                  setEditingMedicine(params.row);
                  setFormOpen(true);
                  setServerError(null);
                }}
              />
            );
          }
          if (canDelete) {
            actions.push(
              <GridActionsCellItem
                key="delete"
                icon={<DeleteOutlineRoundedIcon />}
                label="Delete"
                onClick={() => setPendingDelete(params.row)}
              />
            );
          }
          return actions;
        },
      });
    }

    return base;
  }, [canDelete, canUpdate]);

  const handleFormSubmit = async (values: MedicineFormValues) => {
    setServerError(null);
    try {
      if (editingMedicine) {
        await updateMedicine.mutateAsync({ id: editingMedicine.id, payload: toUpdateMedicinePayload(values) });
        showSuccess(`Medicine ${values.brandName} updated.`);
      } else {
        await createMedicine.mutateAsync(toCreateMedicinePayload(values));
        showSuccess(`Medicine ${values.brandName} created.`);
      }
      setFormOpen(false);
      setEditingMedicine(null);
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not save medicine. Please try again."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMedicine.mutateAsync(pendingDelete.id);
      showSuccess(`Medicine ${pendingDelete.brandName} deleted.`);
      setPendingDelete(null);
    } catch {
      showError("Could not delete medicine. Please try again.");
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Medicine Master
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage pharmacy medicine catalog and pricing.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={() => navigate("/pharmacy/inventory")}>
            Inventory
          </Button>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setEditingMedicine(null);
                setServerError(null);
                setFormOpen(true);
              }}
            >
              Add Medicine
            </Button>
          )}
        </Stack>
      </Stack>

      <Box sx={{ maxWidth: { md: 420 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by code, brand, or generic name"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ border: 0 }}
      />

      <MedicineForm
        open={formOpen}
        defaultValues={editingMedicine ? toMedicineFormValues(editingMedicine) : undefined}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditingMedicine(null);
          setServerError(null);
        }}
        isSubmitting={createMedicine.isPending || updateMedicine.isPending}
        serverError={serverError}
        isEdit={Boolean(editingMedicine)}
      />

      <MedicineDeleteDialog
        medicine={pendingDelete}
        isDeleting={deleteMedicine.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
      <PharmacySnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default MedicineMasterPage;
