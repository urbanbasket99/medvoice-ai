import { Chip, Stack } from "@mui/material";

const SPEAKER_COLORS = ["primary", "secondary", "success", "info", "warning"] as const;

const SpeakerLabels = ({
  segments,
  activeIndex,
  onSelect,
}: {
  segments: Array<{ index: number; speakerLabel: string }>;
  activeIndex?: number | null;
  onSelect?: (index: number) => void;
}) => {
  const speakers = Array.from(new Set(segments.map((segment) => segment.speakerLabel)));
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
      {speakers.map((speaker, speakerIndex) => (
        <Chip
          key={speaker}
          size="small"
          color={SPEAKER_COLORS[speakerIndex % SPEAKER_COLORS.length]}
          variant="outlined"
          label={speaker}
          onClick={() => {
            const first = segments.find((segment) => segment.speakerLabel === speaker);
            if (first && onSelect) onSelect(first.index);
          }}
          sx={{
            cursor: onSelect ? "pointer" : "default",
            opacity: activeIndex != null && !segments.some((s) => s.index === activeIndex && s.speakerLabel === speaker) ? 0.6 : 1,
          }}
        />
      ))}
    </Stack>
  );
};

export default SpeakerLabels;
