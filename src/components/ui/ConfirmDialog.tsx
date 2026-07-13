import type { ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  confirmingLabel,
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "error.light",
          color: "error.dark",
          flexShrink: 0,
        }}
      >
        <WarningAmberRoundedIcon fontSize="small" />
      </Box>
      {title}
    </DialogTitle>
    <DialogContent sx={{ pt: 0 }}>
      <DialogContentText component="div" sx={{ color: "text.secondary" }}>
        {message}
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button onClick={onClose} disabled={isPending} variant="outlined">
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {isPending ? (confirmingLabel ?? confirmLabel) : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
