export const formatSegmentTime = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const averageConfidence = (
  segments: { confidence: number | null }[] | null | undefined
): number | null => {
  const values = (segments ?? [])
    .map((segment) => segment.confidence)
    .filter((value): value is number => typeof value === "number");
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};
