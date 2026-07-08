import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import type { MedicalNotes } from "../../types/MedicalNotes";

interface Props {
  medicalNotes: MedicalNotes;
}

const NOTE_SECTIONS: Array<{ key: keyof MedicalNotes; label: string }> = [
  { key: "chiefComplaint", label: "Chief Complaint" },
  { key: "history", label: "History" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "prescription", label: "Prescription" },
  { key: "advice", label: "Advice" },
];

const MedicalNotesCard = ({ medicalNotes }: Props) => (
  <Card variant="outlined" elevation={0} sx={{ mt: 4 }}>
    <CardHeader
      avatar={<LocalHospitalRoundedIcon color="primary" aria-hidden />}
      title="AI Medical Notes"
      titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
    />
    <Divider />
    <CardContent>
      <Stack spacing={2}>
        {NOTE_SECTIONS.map(({ key, label }) => (
          <Paper key={key} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="body2" whiteSpace={key === "advice" ? "pre-line" : undefined}>
              {medicalNotes[key] || "—"}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

export default MedicalNotesCard;
