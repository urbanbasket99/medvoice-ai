const UNITS: Array<{ limitSeconds: number; divisorSeconds: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { limitSeconds: 60, divisorSeconds: 1, unit: "second" },
  { limitSeconds: 3600, divisorSeconds: 60, unit: "minute" },
  { limitSeconds: 86400, divisorSeconds: 3600, unit: "hour" },
  { limitSeconds: 2592000, divisorSeconds: 86400, unit: "day" },
  { limitSeconds: 31536000, divisorSeconds: 2592000, unit: "month" },
  { limitSeconds: Infinity, divisorSeconds: 31536000, unit: "year" },
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Formats an ISO timestamp as "5 minutes ago", "2 hours ago", etc. */
export const formatRelativeTime = (isoTimestamp: string): string => {
  const elapsedSeconds = (Date.now() - new Date(isoTimestamp).getTime()) / 1000;

  if (elapsedSeconds < 5) return "just now";

  const matched = UNITS.find((unit) => elapsedSeconds < unit.limitSeconds) ?? UNITS[UNITS.length - 1];
  const value = Math.floor(elapsedSeconds / matched.divisorSeconds);
  return relativeTimeFormatter.format(-value, matched.unit);
};
