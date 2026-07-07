import { Box } from "@mui/material";

const Waveform = ({ levels, isActive }: { levels: number[]; isActive: boolean }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 0.5,
      height: 96,
      px: 2,
    }}
    aria-hidden
  >
    {levels.map((level, index) => (
      <Box
        key={index}
        sx={{
          width: 4,
          borderRadius: 1,
          height: `${Math.round(level * 100)}%`,
          minHeight: 8,
          bgcolor: isActive ? "primary.main" : "action.disabledBackground",
          opacity: isActive ? 0.85 + level * 0.15 : 0.6,
          transition: isActive ? "height 80ms linear" : "height 300ms ease",
        }}
      />
    ))}
  </Box>
);

export default Waveform;
