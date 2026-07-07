import { Chip, Tooltip } from "@mui/material";

const confidenceColor = (confidence: number | null): "success" | "warning" | "error" | "default" => {
  if (confidence == null) return "default";
  if (confidence >= 0.85) return "success";
  if (confidence >= 0.65) return "warning";
  return "error";
};

const ConfidenceIndicator = ({ confidence, label }: { confidence: number | null; label?: string }) => {
  const text =
    confidence == null ? "Unknown confidence" : `${Math.round(confidence * 100)}% confidence`;
  return (
    <Tooltip title={text}>
      <Chip
        size="small"
        color={confidenceColor(confidence)}
        variant={confidence == null ? "outlined" : "filled"}
        label={label ?? (confidence == null ? "N/A" : `${Math.round(confidence * 100)}%`)}
      />
    </Tooltip>
  );
};

export default ConfidenceIndicator;
