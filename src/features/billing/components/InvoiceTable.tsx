import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";

import {
  formatCurrency,
  formatDisplayDate,
  getStatusChipColor,
  INVOICE_STATUS_LABELS,
} from "../utils/billingUtils";
import type { Invoice } from "../types/billing.types";

export interface InvoiceTableProps {
  rows: Invoice[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onPay?: (invoice: Invoice) => void;
  canDelete: boolean;
  canPay?: boolean;
}

const InvoiceTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onView,
  onDelete,
  onPay,
  canDelete,
  canPay,
}: InvoiceTableProps) => {
  const columns = useMemo<GridColDef<Invoice>[]>(() => {
    const base: GridColDef<Invoice>[] = [
      { field: "invoiceNumber", headerName: "Invoice #", width: 140 },
      { field: "consultationVisitNumber", headerName: "Visit #", width: 110 },
      { field: "patientName", headerName: "Patient", flex: 1, minWidth: 160 },
      { field: "patientMrn", headerName: "MRN", width: 120 },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params) => (
          <Chip
            size="small"
            label={INVOICE_STATUS_LABELS[params.row.status]}
            color={getStatusChipColor(params.row.status)}
          />
        ),
      },
      {
        field: "grandTotal",
        headerName: "Total",
        width: 120,
        valueFormatter: (value: string) => formatCurrency(value),
      },
      {
        field: "balance",
        headerName: "Balance",
        width: 120,
        valueFormatter: (value: string) => formatCurrency(value),
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
      },
    ];

    base.push({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 120,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem key="view" icon={<VisibilityRoundedIcon />} label="View" onClick={() => onView(params.row)} />,
        ];
        if (canPay && onPay && Number(params.row.balance) > 0) {
          actions.push(
            <GridActionsCellItem
              key="pay"
              icon={<PaymentRoundedIcon />}
              label="Collect Payment"
              onClick={() => onPay(params.row)}
            />
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

    return base;
  }, [canDelete, canPay, onDelete, onPay, onView]);

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

export default InvoiceTable;
