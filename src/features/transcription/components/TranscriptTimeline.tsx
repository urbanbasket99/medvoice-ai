import { Box, Stack, Typography } from "@mui/material";

import ConfidenceIndicator from "./ConfidenceIndicator";
import { formatSegmentTime } from "../utils/transcriptionUtils";
import type { TranscriptSegment } from "../types/transcription.types";

const TranscriptTimeline = ({
  segments,
  activeIndex,
  onSelect,
}: {
  segments: TranscriptSegment[];
  activeIndex?: number | null;
  onSelect?: (index: number) => void;
}) => (
  <Stack spacing={1.5}>
    {segments.map((segment) => {
      const selected = activeIndex === segment.index;
      return (
        <Box
          key={segment.index}
          onClick={() => onSelect?.(segment.index)}
          sx={{
            p: 1.5,
            borderRadius: 1,
            border: 1,
            borderColor: selected ? "primary.main" : "divider",
            bgcolor: selected ? "action.selected" : "background.paper",
            cursor: onSelect ? "pointer" : "default",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatSegmentTime(segment.startSeconds)} – {formatSegmentTime(segment.endSeconds)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {segment.speakerLabel}
              </Typography>
              <ConfidenceIndicator confidence={segment.confidence} />
            </Stack>
          </Stack>
          <Typography variant="body2">{segment.text.trim()}</Typography>
        </Box>
      );
    })}
  </Stack>
);

export default TranscriptTimeline;
