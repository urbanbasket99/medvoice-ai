import { Box, Button, Typography } from "@mui/material";

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorBanner = ({ message, onRetry, retryLabel = "Retry" }: ErrorBannerProps) => (
  <Box
    role="alert"
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      px: 2,
      py: 1,
      borderRadius: 1,
      bgcolor: "error.light",
      color: "error.dark",
    }}
  >
    <Typography variant="body2">{message}</Typography>
    {onRetry ? (
      <Button size="small" color="error" onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : null}
  </Box>
);

export default ErrorBanner;
