import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";
import type { Consultation } from "../../consultations/types/consultation.types";
import { useInvoices } from "../hooks/useInvoices";
import {
  formatCurrency,
  formatDisplayDate,
  getStatusChipColor,
  INVOICE_STATUS_LABELS,
} from "../utils/billingUtils";

const ConsultationBillingPanel = ({ consultation }: { consultation: Consultation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRead = Boolean(user?.isSuperuser || user?.permissions.includes("billing:read"));
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:create"));

  const invoicesQuery = useInvoices({
    consultationId: consultation.id,
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDir: "desc",
  });

  if (!canRead) return null;

  const invoices = invoicesQuery.data?.items ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ReceiptLongRoundedIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Billing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create or view invoices for this consultation.
                </Typography>
              </Box>
            </Stack>
            {canCreate && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() =>
                  navigate(`/billing/invoices/new?consultationId=${consultation.id}`)
                }
              >
                Create Invoice
              </Button>
            )}
          </Stack>

          {invoicesQuery.isLoading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading invoices…
              </Typography>
            </Stack>
          )}

          {invoicesQuery.isError && (
            <Alert
              severity="error"
              action={<Button onClick={() => void invoicesQuery.refetch()}>Retry</Button>}
            >
              Could not load invoices.
            </Alert>
          )}

          {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length === 0 && (
            <Alert severity="info">No invoices yet for this consultation.</Alert>
          )}

          {invoices.length > 0 && (
            <List dense disablePadding>
              {invoices.map((invoice) => (
                <ListItem
                  key={invoice.id}
                  secondaryAction={
                    <Button
                      size="small"
                      startIcon={<VisibilityRoundedIcon />}
                      onClick={() => navigate(`/billing/invoices/${invoice.id}`)}
                    >
                      View
                    </Button>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {invoice.invoiceNumber}
                        </Typography>
                        <Chip
                          size="small"
                          label={INVOICE_STATUS_LABELS[invoice.status]}
                          color={getStatusChipColor(invoice.status)}
                        />
                      </Stack>
                    }
                    secondary={`${formatCurrency(invoice.grandTotal)} • Balance: ${formatCurrency(invoice.balance)} • ${formatDisplayDate(invoice.createdAt.slice(0, 10))}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConsultationBillingPanel;
