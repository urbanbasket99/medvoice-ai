import { Box, Typography } from "@mui/material";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";

import { APP_NAME } from "../../lib/appMeta";

export interface AppLogoProps {
  /** Show the app name beside the icon. */
  showName?: boolean;
  /** Icon box size in px. */
  size?: number;
  /** Use light colors for dark backgrounds (e.g. login brand panel). */
  variant?: "default" | "light";
}

const AppLogo = ({ showName = true, size = 36, variant = "default" }: AppLogoProps) => {
  const isLight = variant === "light";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isLight ? "rgba(255,255,255,0.15)" : "primary.main",
          color: isLight ? "inherit" : "primary.contrastText",
        }}
      >
        <LocalHospitalRoundedIcon sx={{ fontSize: size * 0.58 }} />
      </Box>
      {showName ? (
        <Typography
          variant="subtitle1"
          component="span"
          noWrap
          sx={{ fontWeight: 700, letterSpacing: "-0.01em", color: isLight ? "inherit" : "text.primary" }}
        >
          {APP_NAME}
        </Typography>
      ) : null}
    </Box>
  );
};

export default AppLogo;
