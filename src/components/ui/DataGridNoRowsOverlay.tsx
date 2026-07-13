import { Box, Typography } from "@mui/material";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

export interface DataGridNoRowsOverlayProps {
  message?: string;
}

const DataGridNoRowsOverlay = ({ message = "No records found" }: DataGridNoRowsOverlayProps) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      py: 5,
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "action.hover",
      }}
    >
      <InboxRoundedIcon sx={{ fontSize: 28, color: "text.disabled" }} aria-hidden />
    </Box>
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default DataGridNoRowsOverlay;
