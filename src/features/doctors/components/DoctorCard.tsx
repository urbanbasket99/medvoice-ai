import { Avatar, Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import { DEPARTMENT_LABELS } from "../schemas/doctorSchema";
import DoctorStatusChip from "./DoctorStatusChip";
import type { Doctor } from "../types/doctor.types";

export interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => (
  <Card variant="outlined">
    <CardContent>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
        <Avatar
          src={doctor.photoUrl ?? undefined}
          alt={doctor.fullName}
          sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 28 }}
        >
          {doctor.fullName.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {doctor.fullName}
            </Typography>
            <DoctorStatusChip status={doctor.status} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {doctor.doctorCode} &bull; {doctor.registrationNumber}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip size="small" label={DEPARTMENT_LABELS[doctor.department]} color="primary" variant="outlined" />
            <Chip size="small" label={doctor.specialization} variant="outlined" />
            <Chip size="small" label={`${doctor.experienceYears} yrs exp.`} variant="outlined" />
          </Stack>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default DoctorCard;
