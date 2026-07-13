import { Alert, Button } from "@mui/material";

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const ErrorBanner = ({ message, onRetry, retryLabel = "Retry" }: ErrorBannerProps) => (
  <Alert
    severity="error"
    variant="outlined"
    action={
      onRetry ? (
        <Button color="error" size="small" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : undefined
    }
    sx={{ alignItems: "center" }}
  >
    {message}
  </Alert>
);

export default ErrorBanner;
