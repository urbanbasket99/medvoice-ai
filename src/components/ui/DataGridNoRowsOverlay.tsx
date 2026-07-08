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
      py: 4,
      gap: 1,
    }}
  >
    <InboxRoundedIcon sx={{ fontSize: 40, color: "text.disabled" }} aria-hidden />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default DataGridNoRowsOverlay;
