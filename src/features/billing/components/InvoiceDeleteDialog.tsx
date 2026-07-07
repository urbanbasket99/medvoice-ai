import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { Invoice } from "../types/billing.types";

const InvoiceDeleteDialog = ({
  invoice,
  isDeleting,
  onConfirm,
  onClose,
}: {
  invoice: Invoice | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(invoice)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Invoice</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete invoice <strong>{invoice?.invoiceNumber}</strong> for{" "}
        <strong>{invoice?.patientName ?? "this patient"}</strong>? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default InvoiceDeleteDialog;
