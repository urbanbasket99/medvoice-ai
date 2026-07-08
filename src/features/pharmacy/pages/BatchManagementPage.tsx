import { useMemo, useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useNavigate } from "react-router-dom";
import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

import { DataGridNoRowsOverlay, dataGridSx } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import BatchForm from "../components/BatchForm";
import MedicineSearch from "../components/MedicineSearch";
import PharmacySnackbar from "../components/PharmacySnackbar";
import { useCreateBatch, useUpdateBatch } from "../hooks/useBatchMutations";
import { useBatches } from "../hooks/useBatches";
import { usePharmacySnackbar } from "../hooks/usePharmacySnackbar";
import type { BatchFormValues } from "../schemas/pharmacySchema";
import type { PharmacyBatch, PharmacyMedicine } from "../types/pharmacy.types";
import {
  batchFormDefaultValues,
  formatDisplayDate,
  formatPrice,
  isExpiringSoon,
  toCreateBatchPayload,
  toUpdateBatchPayload,
} from "../utils/pharmacyUtils";

const BatchManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:update"));

  const [selectedMedicine, setSelectedMedicine] = useState<PharmacyMedicine | string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<PharmacyBatch | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { snackbar, showSuccess, closeSnackbar } = usePharmacySnackbar();

  const medicineId = selectedMedicine && typeof selectedMedicine !== "string" ? selectedMedicine.id : undefined;
  const batchesQuery = useBatches({ medicineId });
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();

  const columns = useMemo<GridColDef<PharmacyBatch>[]>(() => {
    const base: GridColDef<PharmacyBatch>[] = [
      { field: "batchNumber", headerName: "Batch #", width: 130 },
      {
        field: "expiryDate",
        headerName: "Expiry",
        width: 130,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <span>{formatDisplayDate(params.row.expiryDate)}</span>
            {isExpiringSoon(params.row.expiryDate) && <Chip size="small" color="warning" label="Soon" />}
          </Stack>
        ),
      },
      { field: "quantity", headerName: "Qty", width: 80 },
      {
        field: "purchasePrice",
        headerName: "Purchase",
        width: 110,
        valueFormatter: (value: string | null) => formatPrice(value),
      },
      {
        field: "sellingPrice",
        headerName: "Selling",
        width: 110,
        valueFormatter: (value: string | null) => formatPrice(value),
      },
      { field: "supplierName", headerName: "Supplier", flex: 1, minWidth: 140 },
      {
        field: "createdAt",
        headerName: "Created",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
      },
    ];

    if (canUpdate) {
      base.push({
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 70,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditRoundedIcon />}
            label="Edit"
            onClick={() => {
              setEditingBatch(params.row);
              setFormOpen(true);
              setServerError(null);
            }}
          />,
        ],
      });
    }

    return base;
  }, [canUpdate]);

  const handleFormSubmit = async (values: BatchFormValues) => {
    setServerError(null);
    try {
      if (editingBatch) {
        await updateBatch.mutateAsync({ id: editingBatch.id, payload: toUpdateBatchPayload(values) });
        showSuccess(`Batch ${values.batchNumber} updated.`);
      } else {
        await createBatch.mutateAsync(toCreateBatchPayload(values));
        showSuccess(`Batch ${values.batchNumber} created.`);
      }
      setFormOpen(false);
      setEditingBatch(null);
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not save batch. Please try again."));
    }
  };

  const editingDefaults = editingBatch
    ? {
        medicineId: editingBatch.medicineId,
        batchNumber: editingBatch.batchNumber,
        expiryDate: editingBatch.expiryDate.slice(0, 10),
        quantity: editingBatch.quantity,
        purchasePrice: editingBatch.purchasePrice ?? "",
        sellingPrice: editingBatch.sellingPrice ?? "",
        supplierId: editingBatch.supplierId,
      }
    : batchFormDefaultValues(medicineId ?? "");

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Batch Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage medicine batches with expiry tracking.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate("/pharmacy/inventory")}>
          Back to Inventory
        </Button>
      </Stack>

      <Box sx={{ maxWidth: { md: 480 } }}>
        <MedicineSearch
          value={selectedMedicine}
          onChange={setSelectedMedicine}
          label="Filter by Medicine"
        />
      </Box>

      {medicineId && canCreate && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditingBatch(null);
              setServerError(null);
              setFormOpen(true);
            }}
          >
            Add Batch
          </Button>
        </Box>
      )}

      {!medicineId ? (
        <Typography variant="body2" color="text.secondary">
          Select a medicine to view and manage its batches.
        </Typography>
      ) : (
        <DataGrid
          rows={batchesQuery.data ?? []}
          columns={columns}
          getRowId={(row) => row.id}
          loading={batchesQuery.isFetching}
          disableRowSelectionOnClick
          autoHeight
          slots={{ noRowsOverlay: DataGridNoRowsOverlay }}
          sx={dataGridSx}
        />
      )}

      <BatchForm
        open={formOpen}
        defaultValues={editingDefaults}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditingBatch(null);
          setServerError(null);
        }}
        isSubmitting={createBatch.isPending || updateBatch.isPending}
        serverError={serverError}
        isEdit={Boolean(editingBatch)}
      />
      <PharmacySnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default BatchManagementPage;
