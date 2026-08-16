import { Box, Typography } from "@mui/material";
import { GridOverlay } from "@mui/x-data-grid";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

const DataGridNoRowsOverlay = () => {
  return (
    <GridOverlay>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: 2,
          py: 4,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InboxRoundedIcon
            sx={{
              fontSize: 28,
              color: "text.disabled",
            }}
          />
        </Box>

        <Typography color="text.secondary">
          No records found
        </Typography>
      </Box>
    </GridOverlay>
  );
};

export default DataGridNoRowsOverlay;