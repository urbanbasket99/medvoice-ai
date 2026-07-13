import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: ReactNode;
  status?: "default" | "success" | "warning" | "error" | "info";
}

export interface TimelineProps {
  items: TimelineItem[];
  emptyMessage?: string;
}

const STATUS_COLORS: Record<NonNullable<TimelineItem["status"]>, string> = {
  default: "grey.400",
  success: "success.main",
  warning: "warning.main",
  error: "error.main",
  info: "info.main",
};

const Timeline = ({ items, emptyMessage = "No activity yet." }: TimelineProps) => {
  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {items.map((item, index) => (
        <Stack key={item.id} direction="row" spacing={2} sx={{ position: "relative", pb: index < items.length - 1 ? 2.5 : 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: STATUS_COLORS[item.status ?? "default"],
                border: 2,
                borderColor: "background.paper",
                boxShadow: 1,
                zIndex: 1,
              }}
            />
            {index < items.length - 1 && (
              <Box sx={{ flex: 1, width: 2, bgcolor: "divider", mt: 0.5, minHeight: 24 }} />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, pt: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {item.timestamp}
              </Typography>
            </Stack>
            {item.description && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
                {item.description}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

export default Timeline;
