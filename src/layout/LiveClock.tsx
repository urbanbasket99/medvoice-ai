import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const formatClock = (date: Date): { time: string; date: string } => ({
  time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true }),
  date: date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
});

const LiveClock = () => {
  const [now, setNow] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setNow(formatClock(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", alignItems: "flex-end", lineHeight: 1.2 }}>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
        {now.time}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
        {now.date}
      </Typography>
    </Box>
  );
};

export default LiveClock;
