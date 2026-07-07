import { useMemo, useState } from "react";

import { Box, Button, InputAdornment, Stack, TextField, Typography } from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { useNavigate } from "react-router-dom";

import type { GridPaginationModel } from "@mui/x-data-grid";



import RadiologyTestMasterTable from "../components/RadiologyTestMasterTable";

import { useRadiologyTestSearch } from "../hooks/useRadiologyTestSearch";

import { useRadiologyTests } from "../hooks/useRadiologyOrders";



const RadiologyTestMasterPage = () => {

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });



  const isSearching = searchQuery.trim().length > 0;



  const catalogQuery = useRadiologyTests({

    page: paginationModel.page + 1,

    pageSize: paginationModel.pageSize,

  });



  const searchResult = useRadiologyTestSearch(isSearching ? searchQuery : "");



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

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>

        <Box>

          <Typography variant="h5" sx={{ fontWeight: 700 }}>

            Radiology Test Catalog

          </Typography>

          <Typography variant="body2" color="text.secondary">

            Browse the active radiology test master catalog.

          </Typography>

        </Box>

        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/radiology/orders")}>

          Back to Radiology Orders

        </Button>

      </Stack>



      <Box sx={{ maxWidth: { md: 420 } }}>

        <TextField

          fullWidth

          size="small"

          placeholder="Search by test name, code, or body part"

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



      <RadiologyTestMasterTable

        rows={rows}

        rowCount={rowCount}

        loading={activeQuery.isFetching}

        paginationModel={paginationModel}

        onPaginationModelChange={setPaginationModel}

      />

    </Stack>

  );

};



export default RadiologyTestMasterPage;

