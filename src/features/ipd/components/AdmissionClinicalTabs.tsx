import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { ipdApi } from "../api/ipdApi";
import {
  admissionChargesQueryOptions,
  ipdQueryKeys,
  mlcCaseQueryOptions,
  nursingNotesQueryOptions,
  otSchedulesQueryOptions,
} from "../api/ipdQueries";
import type { ChargeType, NursingNoteType } from "../types/ipd.types";

interface AdmissionClinicalTabsProps {
  admissionId: string;
  canCreate: boolean;
  canUpdate: boolean;
}

const NOTE_TYPES: NursingNoteType[] = ["vitals", "medication", "observation", "procedure", "other"];
const CHARGE_TYPES: ChargeType[] = ["room", "nursing", "ot", "pharmacy", "misc"];

const AdmissionClinicalTabs = ({ admissionId, canCreate, canUpdate }: AdmissionClinicalTabsProps) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);

  const nursingQuery = useQuery(nursingNotesQueryOptions(admissionId));
  const otQuery = useQuery(otSchedulesQueryOptions(admissionId));
  const mlcQuery = useQuery(mlcCaseQueryOptions(admissionId));
  const chargesQuery = useQuery(admissionChargesQueryOptions(admissionId));

  const [noteForm, setNoteForm] = useState({
    noteType: "observation" as NursingNoteType,
    content: "",
    recordedAt: new Date().toISOString().slice(0, 16),
  });
  const [otForm, setOtForm] = useState({
    surgeryName: "",
    surgeonId: "",
    theatre: "",
    scheduledAt: new Date().toISOString().slice(0, 16),
    notes: "",
  });
  const [mlcForm, setMlcForm] = useState({
    policeStation: "",
    firNumber: "",
    injuryDetails: "",
    incidentDatetime: "",
    isActive: true,
  });
  const [chargeForm, setChargeForm] = useState({
    chargeType: "room" as ChargeType,
    description: "",
    amount: "",
    chargeDate: new Date().toISOString().slice(0, 10),
  });

  const invalidateClinical = () => {
    void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.nursingNotes(admissionId) });
    void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.otSchedules(admissionId) });
    void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.mlcCase(admissionId) });
    void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.charges(admissionId) });
  };

  const noteMutation = useMutation({
    mutationFn: () =>
      ipdApi.createNursingNote(admissionId, {
        noteType: noteForm.noteType,
        content: noteForm.content,
        recordedAt: noteForm.recordedAt,
      }),
    onSuccess: () => {
      setNoteForm((prev) => ({ ...prev, content: "" }));
      invalidateClinical();
    },
  });

  const otMutation = useMutation({
    mutationFn: () =>
      ipdApi.createOtSchedule(admissionId, {
        surgeryName: otForm.surgeryName,
        surgeonId: otForm.surgeonId,
        theatre: otForm.theatre,
        scheduledAt: otForm.scheduledAt,
        notes: otForm.notes,
      }),
    onSuccess: () => {
      setOtForm({ surgeryName: "", surgeonId: "", theatre: "", scheduledAt: new Date().toISOString().slice(0, 16), notes: "" });
      invalidateClinical();
    },
  });

  const mlcMutation = useMutation({
    mutationFn: () =>
      ipdApi.upsertMlcCase(admissionId, {
        policeStation: mlcForm.policeStation,
        firNumber: mlcForm.firNumber,
        injuryDetails: mlcForm.injuryDetails,
        incidentDatetime: mlcForm.incidentDatetime || null,
        isActive: mlcForm.isActive,
      }),
    onSuccess: () => invalidateClinical(),
  });

  const chargeMutation = useMutation({
    mutationFn: () =>
      ipdApi.createAdmissionCharge(admissionId, {
        chargeType: chargeForm.chargeType,
        description: chargeForm.description,
        amount: Number(chargeForm.amount),
        chargeDate: chargeForm.chargeDate,
      }),
    onSuccess: () => {
      setChargeForm((prev) => ({ ...prev, description: "", amount: "" }));
      invalidateClinical();
    },
  });

  const invoiceMutation = useMutation({
    mutationFn: () =>
      ipdApi.generateAdmissionInvoice(admissionId, {
        invoiceDate: new Date().toISOString().slice(0, 10),
      }),
    onSuccess: (result) => {
      setInvoiceMessage(`Invoice ${result.invoiceNumber} created.`);
      invalidateClinical();
    },
  });

  const handleAction = async (action: () => Promise<unknown>) => {
    setError(null);
    setInvoiceMessage(null);
    try {
      await action();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Request failed."));
    }
  };

  useEffect(() => {
    if (!mlcQuery.data) return;
    setMlcForm({
      policeStation: mlcQuery.data.policeStation ?? "",
      firNumber: mlcQuery.data.firNumber ?? "",
      injuryDetails: mlcQuery.data.injuryDetails ?? "",
      incidentDatetime: mlcQuery.data.incidentDatetime?.slice(0, 16) ?? "",
      isActive: mlcQuery.data.isActive,
    });
  }, [mlcQuery.data]);

  return (
    <Card variant="outlined">
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label="Nursing" />
        <Tab label="OT" />
        <Tab label="MLC" />
        <Tab label="Billing" />
      </Tabs>
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {invoiceMessage && <Alert severity="success" sx={{ mb: 2 }}>{invoiceMessage}</Alert>}

        {tab === 0 && (
          <Stack spacing={2}>
            {(nursingQuery.data ?? []).map((note) => (
              <Box key={note.id} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {note.noteType} · {note.recordedAt.slice(0, 16)} · {note.recordedByName ?? "Staff"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{note.content}</Typography>
              </Box>
            ))}
            {canCreate && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <TextField select size="small" label="Note type" value={noteForm.noteType} onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value as NursingNoteType })}>
                    {NOTE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                  <TextField size="small" label="Recorded at" type="datetime-local" value={noteForm.recordedAt} onChange={(e) => setNoteForm({ ...noteForm, recordedAt: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField size="small" label="Content" multiline minRows={2} value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
                  <Button variant="contained" disabled={noteMutation.isPending} onClick={() => void handleAction(() => noteMutation.mutateAsync())}>Add note</Button>
                </Stack>
              </>
            )}
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            {(otQuery.data ?? []).map((schedule) => (
              <Box key={schedule.id} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                <Typography variant="subtitle2">{schedule.surgeryName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {schedule.scheduledAt.slice(0, 16)} · {schedule.theatre ?? "TBD"} · {schedule.status}
                </Typography>
              </Box>
            ))}
            {canCreate && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <TextField size="small" label="Surgery name" value={otForm.surgeryName} onChange={(e) => setOtForm({ ...otForm, surgeryName: e.target.value })} />
                  <TextField size="small" label="Surgeon ID" value={otForm.surgeonId} onChange={(e) => setOtForm({ ...otForm, surgeonId: e.target.value })} />
                  <TextField size="small" label="Theatre" value={otForm.theatre} onChange={(e) => setOtForm({ ...otForm, theatre: e.target.value })} />
                  <TextField size="small" label="Scheduled at" type="datetime-local" value={otForm.scheduledAt} onChange={(e) => setOtForm({ ...otForm, scheduledAt: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  <Button variant="contained" disabled={otMutation.isPending} onClick={() => void handleAction(() => otMutation.mutateAsync())}>Schedule surgery</Button>
                </Stack>
              </>
            )}
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            {canUpdate ? (
              <>
                <TextField size="small" label="Police station" value={mlcForm.policeStation} onChange={(e) => setMlcForm({ ...mlcForm, policeStation: e.target.value })} />
                <TextField size="small" label="FIR number" value={mlcForm.firNumber} onChange={(e) => setMlcForm({ ...mlcForm, firNumber: e.target.value })} />
                <TextField size="small" label="Incident datetime" type="datetime-local" value={mlcForm.incidentDatetime} onChange={(e) => setMlcForm({ ...mlcForm, incidentDatetime: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField size="small" label="Injury details" multiline minRows={3} value={mlcForm.injuryDetails} onChange={(e) => setMlcForm({ ...mlcForm, injuryDetails: e.target.value })} />
                <Button variant="contained" disabled={mlcMutation.isPending} onClick={() => void handleAction(() => mlcMutation.mutateAsync())}>Save MLC case</Button>
              </>
            ) : (
              <Typography variant="body2">{mlcQuery.data ? "MLC case on file." : "No MLC case recorded."}</Typography>
            )}
          </Stack>
        )}

        {tab === 3 && (
          <Stack spacing={2}>
            {(chargesQuery.data ?? []).map((charge) => (
              <Box key={charge.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography variant="body2">{charge.description} ({charge.chargeType})</Typography>
                <Typography variant="body2">{charge.amount.toFixed(2)} · {charge.invoiceId ? "Invoiced" : "Open"}</Typography>
              </Box>
            ))}
            {canCreate && (
              <>
                <Divider />
                <Stack spacing={1.5}>
                  <TextField select size="small" label="Charge type" value={chargeForm.chargeType} onChange={(e) => setChargeForm({ ...chargeForm, chargeType: e.target.value as ChargeType })}>
                    {CHARGE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                  <TextField size="small" label="Description" value={chargeForm.description} onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })} />
                  <TextField size="small" label="Amount" type="number" value={chargeForm.amount} onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })} />
                  <TextField size="small" label="Charge date" type="date" value={chargeForm.chargeDate} onChange={(e) => setChargeForm({ ...chargeForm, chargeDate: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  <Button variant="contained" disabled={chargeMutation.isPending} onClick={() => void handleAction(() => chargeMutation.mutateAsync())}>Add charge</Button>
                </Stack>
              </>
            )}
            {canUpdate && (
              <Button variant="outlined" disabled={invoiceMutation.isPending} onClick={() => void handleAction(() => invoiceMutation.mutateAsync())}>
                Generate invoice from open charges
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default AdmissionClinicalTabs;
