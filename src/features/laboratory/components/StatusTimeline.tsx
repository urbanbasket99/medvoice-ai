import {
  Box,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

import type { LabOrderStatusEvent } from "../types/laboratory.types";
import { formatDisplayDateTime, sortStatusHistory, STATUS_LABELS } from "../utils/laboratoryUtils";

export interface StatusTimelineProps {
  statusHistory: LabOrderStatusEvent[];
}

const StatusTimeline = ({ statusHistory }: StatusTimelineProps) => {
  const events = sortStatusHistory(statusHistory);

  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No status history recorded.
      </Typography>
    );
  }

  return (
    <Stepper orientation="vertical" activeStep={events.length - 1}>
      {events.map((event, index) => (
        <Step key={event.id} expanded active={index === events.length - 1}>
          <StepLabel>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {STATUS_LABELS[event.status] ?? event.status}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDisplayDateTime(event.changedAt)}
            </Typography>
          </StepLabel>
          {event.notes && (
            <StepContent>
              <Box sx={{ pb: 1 }}>
                <Typography variant="body2">{event.notes}</Typography>
              </Box>
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  );
};

export default StatusTimeline;
