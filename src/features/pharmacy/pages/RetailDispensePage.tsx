import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import QrCodeScannerRoundedIcon from "@mui/icons-material/QrCodeScannerRounded";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { pharmacyApi } from "../api/pharmacyApi";
import { useCreateDispense } from "../hooks/useDispenseMutations";
import type { CreateDispensePayload, DispenseItemPayload } from "../types/pharmacy.types";

const RetailDispensePage = () => {
  const navigate = useNavigate();
  const createDispense = useCreateDispense();
  const [patientId, setPatientId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DispenseItemPayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const handleBarcodeLookup = async () => {
    if (!barcode.trim()) return;
    setScanMessage(null);
    try {
      const medicine = await pharmacyApi.getMedicineByBarcode(barcode.trim());
      setItems((prev) => [
        ...prev,
        {
          medicineId: medicine.id,
          medicineName: `${medicine.brandName} (${medicine.genericName})`,
          quantity: 1,
          unitPrice: medicine.sellingPrice,
          sortOrder: prev.length,
        },
      ]);
      setBarcode("");
      setScanMessage(`Added ${medicine.brandName}.`);
    } catch (lookupError) {
      setScanMessage(extractApiErrorMessage(lookupError, "Medicine not found for this barcode."));
    }
  };

  const handleSubmit = async () => {
    if (!patientId.trim()) {
      setError("Patient ID is required for walk-in retail billing.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one medicine.");
      return;
    }
    setError(null);
    const payload: CreateDispensePayload = {
      dispenseType: "retail",
      patientId: patientId.trim(),
      notes: notes.trim() || null,
      items,
    };
    try {
      const dispense = await createDispense.mutateAsync(payload);
      navigate(`/pharmacy/dispense/${dispense.id}`, {
        replace: true,
        state: { flashMessage: "Retail dispense created successfully." },
      });
    } catch (submitError) {
      setError(extractApiErrorMessage(submitError, "Could not create retail dispense."));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Retail / walk-in billing"
        subtitle="Dispense medicines without a prescription. Scan barcode or add items manually."
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Patient ID"
              required
              helperText="Enter patient UUID from registration or patient chart URL."
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
              <TextField
                label="Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleBarcodeLookup()}
                fullWidth
                InputProps={{ startAdornment: <QrCodeScannerRoundedIcon sx={{ mr: 1, color: "text.secondary" }} /> }}
              />
              <Button variant="outlined" onClick={() => void handleBarcodeLookup()}>
                Scan / lookup
              </Button>
            </Stack>
            {scanMessage && (
              <Typography variant="body2" color="text.secondary">
                {scanMessage}
              </Typography>
            )}
            <TextField label="Notes" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

            <Typography variant="subtitle2">Items ({items.length})</Typography>
            {items.map((item, index) => (
              <Stack key={`${item.medicineId}-${index}`} direction="row" spacing={1} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{item.medicineName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Qty {item.quantity} · {item.unitPrice ?? "—"}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="Remove item"
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => void handleSubmit()} disabled={createDispense.isPending}>
              Create retail dispense
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default RetailDispensePage;
