import { useCallback, useState } from "react";
import { Box, Button, Tooltip } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import SearchDialog from "./SearchDialog";
import { useGlobalSearchShortcut } from "../hooks/useGlobalSearchShortcut";

const GlobalSearchBar = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  useGlobalSearchShortcut(handleOpen);

  return (
    <>
      <Tooltip title="Search (Ctrl+K)">
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<SearchRoundedIcon fontSize="small" />}
          onClick={() => setOpen(true)}
          sx={{
            minWidth: { xs: 40, sm: 180 },
            px: { xs: 1, sm: 1.5 },
            color: "text.secondary",
            borderColor: "divider",
            textTransform: "none",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Search…
          </Box>
          <Box
            component="span"
            sx={{
              display: { xs: "none", md: "inline" },
              ml: "auto",
              pl: 2,
              color: "text.disabled",
              fontSize: 12,
            }}
          >
            Ctrl+K
          </Box>
        </Button>
      </Tooltip>

      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default GlobalSearchBar;
