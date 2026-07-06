import type { ReactElement } from "react";
import {
  Alert,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";

import { useAiActivity } from "../hooks/useDashboardData";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import type { AiActivityStatus, AiActivityType } from "../types/dashboard.types";

const TYPE_ICONS: Record<AiActivityType, ReactElement> = {
  transcription: <GraphicEqRoundedIcon fontSize="small" />,
  notesGenerated: <NoteAddRoundedIcon fontSize="small" />,
  reviewPending: <FlagRoundedIcon fontSize="small" />,
};

const STATUS_LABEL: Record<AiActivityStatus, string> = {
  success: "Completed",
  processing: "Processing",
  attention: "Needs review",
};

const STATUS_CHIP_COLOR: Record<AiActivityStatus, "success" | "info" | "warning"> = {
  success: "success",
  processing: "info",
  attention: "warning",
};

const AiActivityCard = () => {
  const { data: events, isLoading, error } = useAiActivity();

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="AI Activity" subheader="Voice transcription & note generation" />
      <Divider />
      <CardContent>
        {error && <Alert severity="error">{error}</Alert>}

        {!error && (isLoading || !events) && (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={48} />
            ))}
          </Stack>
        )}

        {!error && events && (
          <List disablePadding>
            {events.map((event, index) => (
              <ListItem
                key={event.id}
                disableGutters
                divider={index < events.length - 1}
                sx={{ py: 1.25 }}
                secondaryAction={
                  <Chip
                    size="small"
                    label={STATUS_LABEL[event.status]}
                    color={STATUS_CHIP_COLOR[event.status]}
                    variant="outlined"
                  />
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={(theme) => ({
                      backgroundColor: theme.clinical.ai.panelBackground,
                      color: theme.palette.text.primary,
                    })}
                  >
                    {TYPE_ICONS[event.type]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={event.description}
                  secondary={`Patient ${event.patientInitials} \u2022 ${formatRelativeTime(event.occurredAt)}`}
                  sx={{ pr: 12 }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default AiActivityCard;
