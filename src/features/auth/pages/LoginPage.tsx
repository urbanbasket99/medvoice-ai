import { useLocation, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

import { APP_NAME, APP_TAGLINE, APP_VERSION } from "../../../lib/appMeta";
import LoginForm from "../components/LoginForm";

interface RedirectLocationState {
  from?: { pathname: string };
}

const BRAND_FEATURES = [
  { icon: <GroupsRoundedIcon fontSize="small" />, label: "Unified patient & clinical workflows" },
  { icon: <SmartToyRoundedIcon fontSize="small" />, label: "AI-assisted documentation" },
  { icon: <VerifiedUserRoundedIcon fontSize="small" />, label: "Enterprise-grade security & audit" },
] as const;

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
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          color: "primary.contrastText",
          background: (theme) =>
            `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.15)",
            }}
          >
            <LocalHospitalRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {APP_NAME}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Healthcare Management System
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={3} sx={{ maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={700} lineHeight={1.25}>
            Modern care delivery, powered by intelligent workflows.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92 }}>
            {APP_TAGLINE}
          </Typography>
          <Stack spacing={1.5}>
            {BRAND_FEATURES.map(({ icon, label }) => (
              <Stack key={label} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ opacity: 0.95, display: "flex" }}>{icon}</Box>
                <Typography variant="body2">{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{ opacity: 0.75 }}>
          © {new Date().getFullYear()} MedVoice AI. All rights reserved.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
        }}
      >
        <Stack spacing={3} sx={{ width: "100%", maxWidth: 420 }}>
          <Stack spacing={0.5} sx={{ display: { md: "none" }, textAlign: "center" }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
              <LocalHospitalRoundedIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                {APP_NAME}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </Stack>

          <Card elevation={0} sx={{ boxShadow: (theme) => theme.customShadows.card, borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={0.5} sx={{ mb: 3, display: { xs: "none", md: "block" } }}>
                <Typography variant="h5" component="h1" fontWeight={700}>
                  Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your credentials to access the hospital system.
                </Typography>
              </Stack>

              <LoginForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            {APP_NAME} v{APP_VERSION} · Secure access for authorized staff only
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;
