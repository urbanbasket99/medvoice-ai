import { useLocation, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

import LoginForm from "../components/LoginForm";

interface RedirectLocationState {
  from?: { pathname: string };
}

/**
 * Public sign-in page. Purely a composition of `LoginForm` inside a
 * centered card — no auth logic lives here beyond deciding where to
 * navigate on success.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = (): void => {
    const state = location.state as RedirectLocationState | null;
    navigate(state?.from?.pathname ?? "/", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to access MedVoice AI HMS.
            </Typography>
          </Stack>

          <LoginForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
