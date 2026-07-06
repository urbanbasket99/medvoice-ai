import {
  Card,
  CardContent,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { MedicalNotes } from "../../types/MedicalNotes";

interface Props {
  medicalNotes: MedicalNotes;
}

const MedicalNotesCard = ({ medicalNotes }: Props) => {
  return (
    <Card
      elevation={5}
      sx={{
        mt: 4,
        borderRadius: 3,
      }}
    >
      <CardContent>

        <Typography variant="h5" fontWeight="bold">
          🏥 AI Medical Notes
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>

          <Paper sx={{ p: 2 }}>
            <Typography fontWeight="bold">
              🩺 Chief Complaint
            </Typography>

            <Typography>
              {medicalNotes.chiefComplaint || "-"}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography fontWeight="bold">
              📖 History
            </Typography>

            <Typography>
              {medicalNotes.history || "-"}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography fontWeight="bold">
              🩹 Diagnosis
            </Typography>

            <Typography>
              {medicalNotes.diagnosis || "-"}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography fontWeight="bold">
              💊 Prescription
            </Typography>

            <Typography>
              {medicalNotes.prescription || "-"}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography fontWeight="bold">
              💡 Advice
            </Typography>

            <Typography whiteSpace="pre-line">
              {medicalNotes.advice || "-"}
            </Typography>
          </Paper>

        </Stack>

      </CardContent>
    </Card>
    
  );
};

export default MedicalNotesCard;