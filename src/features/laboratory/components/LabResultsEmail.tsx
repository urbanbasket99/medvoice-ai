import { useState } from "react";
import { Alert, Button, Card, CardContent, CardHeader, MenuItem, Stack, TextField } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import { useMutation } from "@tanstack/react-query";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { laboratoryApi } from "../api/laboratoryApi";

interface LabResultsEmailProps {
  labOrderId: string;
  defaultEmail?: string | null;
}

const LabResultsEmail = ({ labOrderId, defaultEmail }: LabResultsEmailProps) => {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMutation = useMutation({
    mutationFn: () =>
      laboratoryApi.emailResults(labOrderId, {
        recipientEmail: email.trim(),
        recipientRole: role,
      }),
  });

  const handleSend = async () => {
    if (!email.trim()) {
      setError("Recipient email is required.");
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const result = await sendMutation.mutateAsync();
      setMessage(`Report queued as ${result.status} to ${result.recipientEmail}.`);
    } catch (sendError) {
      setError(extractApiErrorMessage(sendError, "Could not send lab results email."));
    }
  };

  return (
    <Card>
      <CardHeader title="Email results" subheader="Deliver lab report to patient or doctor (logged delivery)." />
      <CardContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
          <TextField label="Recipient email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField select label="Recipient role" value={role} onChange={(e) => setRole(e.target.value as "patient" | "doctor")}>
            <MenuItem value="patient">Patient</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
          </TextField>
          <Button variant="outlined" startIcon={<EmailRoundedIcon />} onClick={() => void handleSend()} disabled={sendMutation.isPending}>
            Send email
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LabResultsEmail;
