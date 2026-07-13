import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
} from "@mui/material";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { isAxiosError } from "axios";

import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../schemas/login.schema";
import type { LoginFormValues } from "../schemas/login.schema";
import { loadRememberedEmail, saveRememberedEmail } from "../utils/rememberEmail";

export interface LoginFormProps {
  onSuccess?: () => void;
}

interface ApiErrorBody {
  detail?: string;
}

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "Cannot reach the API server. Ensure the backend is running on port 8000.";
    }
    if (error.response.data?.detail) {
      return error.response.data.detail;
    }
  }
  return "Unable to sign in. Please check your credentials and try again.";
};

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, isLoggingIn } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const { email, remember } = loadRememberedEmail();
    if (email) setValue("email", email);
    setRememberMe(remember);
  }, [setValue]);

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setFormError(null);
    try {
      await login(values);
      saveRememberedEmail(values.email, rememberMe);
      onSuccess?.();
    } catch (error) {
      setFormError(extractErrorMessage(error));
    }
  };

  return (
    <>
      <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <Stack spacing={2.5}>
          <Collapse in={Boolean(formError)} unmountOnExit>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
          </Collapse>

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            {...register("email")}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            fullWidth
            {...register("password")}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
              }
              label={<Box component="span" sx={{ typography: "body2" }}>Remember me</Box>}
            />
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              onClick={() => setForgotOpen(true)}
              sx={{ fontWeight: 500 }}
            >
              Forgot password?
            </Link>
          </Stack>

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

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset your password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Password resets are managed by your hospital administrator. Please contact your IT or
            system administrator to regain access to your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginForm;
