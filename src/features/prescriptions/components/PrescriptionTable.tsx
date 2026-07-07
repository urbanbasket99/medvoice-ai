import { useMemo } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { formatDisplayDate } from "../utils/prescriptionUtils";
import type { Prescription } from "../types/prescription.types";

export interface PrescriptionTableProps {
  rows: Prescription[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (prescription: Prescription) => void;
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescription: Prescription) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

const PrescriptionTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onView,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: PrescriptionTableProps) => {
  const columns = useMemo<GridColDef<Prescription>[]>(() => {
    const base: GridColDef<Prescription>[] = [
      { field: "consultationVisitNumber", headerName: "Visit #", width: 120 },
      { field: "patientName", headerName: "Patient", flex: 1, minWidth: 160 },
      { field: "doctorName", headerName: "Doctor", width: 160 },
      { field: "diagnosis", headerName: "Diagnosis", width: 180 },
      {
        field: "items",
        headerName: "Medicines",
        width: 100,
        sortable: false,
        valueGetter: (_, row) => row.items.length,
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
        width: 120,
        getActions: (params) => {
          const actions = [
            <GridActionsCellItem key="view" icon={<VisibilityRoundedIcon />} label="View" onClick={() => onView(params.row)} />,
          ];
          if (canUpdate) {
            actions.push(
              <GridActionsCellItem key="edit" icon={<EditRoundedIcon />} label="Edit" onClick={() => onEdit(params.row)} />
            );
          }
          if (canDelete) {
            actions.push(
              <GridActionsCellItem
                key="delete"
                icon={<DeleteOutlineRoundedIcon />}
                label="Delete"
                onClick={() => onDelete(params.row)}
              />
            );
          }
          return actions;
        },
      });
    }

    return base;
  }, [canDelete, canUpdate, onDelete, onEdit, onView]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      rowCount={rowCount}
      loading={loading}
      paginationMode="server"
      sortingMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      pageSizeOptions={[10, 20, 50]}
      disableRowSelectionOnClick
      autoHeight
      sx={{ border: 0 }}
    />
  );
};

export default PrescriptionTable;
