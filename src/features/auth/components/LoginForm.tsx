import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { isAxiosError } from "axios";

import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormValues } from "../schemas/login.schema";

export interface LoginFormProps {
  onSuccess?: () => void;
}

interface ApiErrorBody {
  detail?: string;
}

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data.detail) {
    return error.response.data.detail;
  }
  return "Unable to sign in. Please try again.";
};

/**
 * Login form: React Hook Form for state/validation wiring, Zod
 * (`loginSchema`) for the actual validation rules. Submission delegates to
 * `useAuth().login`, so this component has no direct knowledge of the API.
 */
const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, isLoggingIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setFormError(null);
    try {
      await login(values);
      onSuccess?.();
    } catch (error) {
      setFormError(extractErrorMessage(error));
    }
  };

  return (
    <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Stack spacing={2}>
        {formError && <Alert severity="error">{formError}</Alert>}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          fullWidth
          {...register("email")}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          fullWidth
          {...register("password")}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoggingIn}
          startIcon={isLoggingIn ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isLoggingIn ? "Signing in…" : "Sign In"}
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginForm;
