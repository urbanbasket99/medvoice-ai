import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { usePurchaseReturn, useSalesReturn } from "../hooks/useStockReturnMutations";
import type { MedicineStock } from "../types/pharmacy.types";

type ReturnKind = "purchase" | "sales";

interface StockReturnDialogProps {
  stock: MedicineStock | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const StockReturnDialog = ({ stock, open, onClose, onSuccess }: StockReturnDialogProps) => {
  const purchaseReturn = usePurchaseReturn();
  const salesReturn = useSalesReturn();
  const [returnKind, setReturnKind] = useState<ReturnKind>("sales");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stock) return;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter a valid quantity.");
      return;
    }
    setError(null);
    const payload = { medicineId: stock.medicineId, quantity: qty, notes: notes.trim() || null };
    try {
      if (returnKind === "sales") {
        await salesReturn.mutateAsync(payload);
        onSuccess("Sales return recorded — stock increased.");
      } else {
        await purchaseReturn.mutateAsync(payload);
        onSuccess("Purchase return recorded — stock decreased.");
      }
      onClose();
    } catch (submitError) {
      setError(extractApiErrorMessage(submitError, "Could not record stock return."));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Stock return</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Medicine"
            value={stock ? `${stock.brandName ?? ""} (${stock.genericName ?? ""})` : ""}
            disabled
            fullWidth
          />
          <TextField select label="Return type" value={returnKind} onChange={(e) => setReturnKind(e.target.value as ReturnKind)}>
            <MenuItem value="sales">Sales return (customer returns stock)</MenuItem>
            <MenuItem value="purchase">Purchase return (return to vendor)</MenuItem>
          </TextField>
          <TextField label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <TextField label="Notes" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void handleSubmit()} disabled={purchaseReturn.isPending || salesReturn.isPending}>
          Record return
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockReturnDialog;
