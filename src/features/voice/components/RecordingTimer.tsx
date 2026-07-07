import { Box, Typography } from "@mui/material";

import { formatRecordingDuration } from "../utils/voiceUtils";

const RecordingTimer = ({
  seconds,
  statusLabel,
}: {
  seconds: number;
  statusLabel?: string;
}) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography
      variant="h3"
      component="p"
      sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, letterSpacing: 2 }}
    >
      {formatRecordingDuration(seconds)}
    </Typography>
    {statusLabel && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {statusLabel}
      </Typography>
    )}
  </Box>
);

export default RecordingTimer;
