import { useState } from "react";

import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import RadiologyRoundedIcon from "../icons/RadiologyRoundedIcon";

import { useNavigate } from "react-router-dom";

import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";



import { ErrorBanner, PageHeader } from "../../../components/ui";

import { useAuth } from "../../auth";

import RadiologyOrderDeleteDialog from "../components/RadiologyOrderDeleteDialog";

import RadiologyOrderSnackbar from "../components/RadiologyOrderSnackbar";

import RadiologyOrderTable from "../components/RadiologyOrderTable";

import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";

import { useDeleteRadiologyOrder } from "../hooks/useDeleteRadiologyOrder";

import { useRadiologyOrderSearch, useRadiologyOrders } from "../hooks/useRadiologyOrders";

import { useRadiologyOrderSnackbar } from "../hooks/useRadiologyOrderSnackbar";

import type { RadiologyOrder, RadiologyOrderSortField } from "../types/radiology.types";



const SORT_FIELD_MAP: Record<string, RadiologyOrderSortField> = {

  orderNumber: "order_number",

  createdAt: "created_at",

  updatedAt: "updated_at",

};



const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];



const RadiologyOrderListPage = () => {

  const navigate = useNavigate();

  const { user } = useAuth();

  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:create"));

  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:delete"));



  const [searchQuery, setSearchQuery] = useState("");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);

  const [pendingDelete, setPendingDelete] = useState<RadiologyOrder | null>(null);

  const { snackbar, showSuccess, showError, closeSnackbar } = useRadiologyOrderSnackbar();



  useConsumeFlashMessage(showSuccess);



  const isSearching = searchQuery.trim().length > 0;

  const sortEntry = sortModel[0];

  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";

  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";



  const listQuery = useRadiologyOrders({

    page: paginationModel.page + 1,

    pageSize: paginationModel.pageSize,

    sortBy,

    sortDir,

  });



  const searchResult = useRadiologyOrderSearch({

    query: searchQuery,

    page: paginationModel.page + 1,

    pageSize: paginationModel.pageSize,

  });



  const activeQuery = isSearching ? searchResult : listQuery;

  const deleteRadiologyOrder = useDeleteRadiologyOrder();

  const rows = activeQuery.data?.items ?? [];

  const rowCount = activeQuery.data?.total ?? 0;



  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));



  const handleConfirmDelete = async () => {

    if (!pendingDelete) return;

    try {

      await deleteRadiologyOrder.mutateAsync(pendingDelete.id);

      showSuccess(`Radiology order ${pendingDelete.orderNumber} was deleted.`);

      setPendingDelete(null);

    } catch {

      showError("Could not delete radiology order. Please try again.");

    }

  };



  return (

    <Stack spacing={3}>

      <PageHeader
        title="Radiology Orders"
        subtitle="Create, search, and manage radiology imaging orders."
        actions={
          <>
            <Button variant="outlined" startIcon={<RadiologyRoundedIcon />} onClick={() => navigate("/radiology/tests")}>
              Test Catalog
            </Button>
            {canCreate ? (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/radiology/orders/new")}>
                New Radiology Order
              </Button>
            ) : null}
          </>
        }
      />



      <Box sx={{ maxWidth: { md: 420 } }}>

        <TextField

          fullWidth

          size="small"

          placeholder="Search by order number, patient, doctor, or visit number"

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

          message="Failed to load radiology orders. Please try again."

          onRetry={() => void activeQuery.refetch()}

        />

      )}



      <RadiologyOrderTable

        rows={rows}

        rowCount={rowCount}

        loading={activeQuery.isFetching}

        paginationModel={paginationModel}

        onPaginationModelChange={setPaginationModel}

        sortModel={sortModel}

        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}

        onView={(radiologyOrder) => navigate(`/radiology/orders/${radiologyOrder.id}`)}

        onDelete={setPendingDelete}

        canDelete={canDelete}

      />



      <RadiologyOrderDeleteDialog

        radiologyOrder={pendingDelete}

        isDeleting={deleteRadiologyOrder.isPending}

        onConfirm={() => void handleConfirmDelete()}

        onClose={() => setPendingDelete(null)}

      />

      <RadiologyOrderSnackbar state={snackbar} onClose={closeSnackbar} />

    </Stack>

  );

};



export default RadiologyOrderListPage;

