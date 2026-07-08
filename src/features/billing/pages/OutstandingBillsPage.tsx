import { useState } from "react";
import { Button, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { ErrorBanner, PageHeader } from "../../../components/ui";

import { useAuth } from "../../auth";
import BillingSnackbar from "../components/BillingSnackbar";
import InvoiceTable from "../components/InvoiceTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useOutstandingInvoices } from "../hooks/useInvoices";
import { useBillingSnackbar } from "../hooks/useBillingSnackbar";
import type { InvoiceSortField } from "../types/billing.types";

const SORT_FIELD_MAP: Record<string, InvoiceSortField> = {
  invoiceNumber: "invoice_number",
  createdAt: "created_at",
  updatedAt: "updated_at",
  grandTotal: "grand_total",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const OutstandingBillsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:update"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const { snackbar, showSuccess, closeSnackbar } = useBillingSnackbar();

  useConsumeFlashMessage(showSuccess);

  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const outstandingQuery = useOutstandingInvoices({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
  });

  const rows = outstandingQuery.data?.items ?? [];
  const rowCount = outstandingQuery.data?.total ?? 0;

  return (
    <Stack spacing={3}>
      <PageHeader
        backAction={
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/billing/invoices")}>
            Back to Invoices
          </Button>
        }
        title="Outstanding Bills"
        subtitle="Invoices with an outstanding balance requiring payment."
      />

      {outstandingQuery.isError && (
        <ErrorBanner
          message="Failed to load outstanding bills. Please try again."
          onRetry={() => void outstandingQuery.refetch()}
        />
      )}

      <InvoiceTable
        rows={rows}
        rowCount={rowCount}
        loading={outstandingQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}
        onView={(invoice) => navigate(`/billing/invoices/${invoice.id}`)}
        onDelete={() => undefined}
        onPay={(invoice) => navigate(`/billing/invoices/${invoice.id}/payment`)}
        canDelete={false}
        canPay={canUpdate}
      />

      <BillingSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default OutstandingBillsPage;
