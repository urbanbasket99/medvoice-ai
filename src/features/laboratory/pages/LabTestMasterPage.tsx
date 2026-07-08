import { useMemo, useState } from "react";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel } from "@mui/x-data-grid";

import { ErrorBanner, PageHeader } from "../../../components/ui";

import LabTestMasterTable from "../components/LabTestMasterTable";
import { useLabTestSearch } from "../hooks/useLabTestSearch";
import { useLabTests } from "../hooks/useLabOrders";

const LabTestMasterPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const isSearching = searchQuery.trim().length > 0;

  const catalogQuery = useLabTests({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const searchResult = useLabTestSearch(isSearching ? searchQuery : "");

  const activeQuery = isSearching ? searchResult : catalogQuery;

  const rows = useMemo(() => {
    if (isSearching) {
      return searchResult.data?.items ?? [];
    }
    return catalogQuery.data?.items ?? [];
  }, [catalogQuery.data?.items, isSearching, searchResult.data?.items]);

  const rowCount = isSearching ? rows.length : (catalogQuery.data?.total ?? 0);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Lab Test Catalog"
        subtitle="Browse the active laboratory test master catalog."
        actions={
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/laboratory/orders")}>
            Back to Lab Orders
          </Button>
        }
      />

      <Box sx={{ maxWidth: { md: 420 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by test name, code, or department"
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

      {activeQuery.isError && (
        <ErrorBanner message="Failed to load lab test catalog." onRetry={() => void activeQuery.refetch()} />
      )}

      <LabTestMasterTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </Stack>
  );
};

export default LabTestMasterPage;
