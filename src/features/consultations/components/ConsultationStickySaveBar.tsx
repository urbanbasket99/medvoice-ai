import { Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

const ConsultationStickySaveBar = ({
  isSaving,
  disabled,
}: {
  isSaving?: boolean;
  disabled?: boolean;
}) => (
  <Paper
    elevation={8}
    sx={{
      position: "sticky",
      bottom: 0,
      zIndex: 10,
      px: { xs: 2, md: 3 },
      py: 2,
      borderTop: 1,
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  >
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">
        Changes are saved only when you click Save. Autosave is disabled.
      </Typography>
      <Button
        type="submit"
        variant="contained"
        size="large"
        startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
        disabled={disabled || isSaving}
      >
        {isSaving ? "Saving…" : "Save Consultation"}
      </Button>
    </Stack>
  </Paper>
);

export default ConsultationStickySaveBar;
