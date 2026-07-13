import { useState } from "react";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { ErrorBanner, PageHeader } from "../../../components/ui";

import { useAuth } from "../../auth";
import BillingSnackbar from "../components/BillingSnackbar";
import InvoiceDeleteDialog from "../components/InvoiceDeleteDialog";
import InvoiceTable from "../components/InvoiceTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useInvoiceMutations } from "../hooks/useInvoiceMutations";
import { useInvoiceSearch, useInvoices } from "../hooks/useInvoices";
import { useBillingSnackbar } from "../hooks/useBillingSnackbar";
import type { Invoice, InvoiceSortField } from "../types/billing.types";

const SORT_FIELD_MAP: Record<string, InvoiceSortField> = {
  invoiceNumber: "invoice_number",
  createdAt: "created_at",
  updatedAt: "updated_at",
  grandTotal: "grand_total",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:create"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("billing:delete"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:update"));

  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = useBillingSnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = useInvoices({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
  });

  const searchResult = useInvoiceSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const { remove } = useInvoiceMutations();
  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      showSuccess(`Invoice ${pendingDelete.invoiceNumber} was deleted.`);
      setPendingDelete(null);
    } catch {
      showError("Could not delete invoice. Please try again.");
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Invoices"
        subtitle="Create, search, and manage patient invoices."
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<WarningAmberRoundedIcon />}
              onClick={() => navigate("/billing/outstanding")}
            >
              Outstanding Bills
            </Button>
            <Button
              variant="outlined"
              startIcon={<BusinessRoundedIcon />}
              onClick={() => navigate("/billing/tpas")}
            >
              TPAs
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentRoundedIcon />}
              onClick={() => navigate("/billing/reports")}
            >
              Reports
            </Button>
            {canCreate ? (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/billing/invoices/new")}>
                New Invoice
              </Button>
            ) : null}
          </>
        }
      />

      <Box sx={{ maxWidth: { md: 420 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by invoice number, patient, MRN, or visit number"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            resetToFirstPage();
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

      {activeQuery.isError && (
        <ErrorBanner
          message="Failed to load invoices. Please try again."
          onRetry={() => void activeQuery.refetch()}
        />
      )}

      <InvoiceTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}
        onView={(invoice) => navigate(`/billing/invoices/${invoice.id}`)}
        onDelete={setPendingDelete}
        onPay={(invoice) => navigate(`/billing/invoices/${invoice.id}/payment`)}
        canDelete={canDelete}
        canPay={canUpdate}
      />

      <InvoiceDeleteDialog
        invoice={pendingDelete}
        isDeleting={remove.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
      <BillingSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default InvoiceListPage;
