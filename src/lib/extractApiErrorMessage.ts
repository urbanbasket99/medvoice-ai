import type { AxiosError } from "axios";

interface FastApiValidationError {
  type?: string;
  loc?: Array<string | number>;
  msg?: string;
  input?: unknown;
}

type FastApiErrorDetail = string | FastApiValidationError | FastApiValidationError[];

const formatValidationError = (item: FastApiValidationError): string => {
  const field = item.loc?.filter((part) => part !== "body" && part !== "query").join(".");
  const message = item.msg ?? "Validation failed.";
  return field ? `${field}: ${message}` : message;
};

const normalizeDetail = (detail: FastApiErrorDetail): string => {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.map((item) =>
      typeof item === "string" ? item : formatValidationError(item)
    );
    return messages.filter(Boolean).join(" ") || "Request validation failed.";
  }
  if (detail && typeof detail === "object") {
    return formatValidationError(detail);
  }
  return "Request failed.";
};

/** Maps Axios/FastAPI error payloads to a user-visible string. */
export const extractApiErrorMessage = (error: unknown, fallback = "Request failed."): string => {
  const axiosError = error as AxiosError<{ detail?: FastApiErrorDetail }> & { code?: string };
  const detail = axiosError.response?.data?.detail;
  if (detail != null) return normalizeDetail(detail);

  const message = axiosError.message ?? "";
  if (message === "Network Error" || axiosError.code === "ERR_NETWORK") {
    return "Could not reach the server. Check that the backend is running and try again.";
  }
  if (axiosError.code === "ECONNABORTED" || message.toLowerCase().includes("timeout")) {
    return "The request timed out. If transcription was started, check the history list for status updates.";
  }
  if (message) return message;
  return fallback;
};
