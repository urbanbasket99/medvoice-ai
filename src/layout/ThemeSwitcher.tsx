import { useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { useAppTheme } from "../theme/AppThemeProvider";
import type { AppThemeMode } from "../theme/palette";

const THEME_OPTIONS: { mode: AppThemeMode; label: string; icon: React.ReactNode }[] = [
  { mode: "light", label: "Light", icon: <LightModeRoundedIcon fontSize="small" /> },
  { mode: "dark", label: "Dark", icon: <DarkModeRoundedIcon fontSize="small" /> },
  { mode: "hospitalBlue", label: "Hospital Blue", icon: <LocalHospitalRoundedIcon fontSize="small" /> },
];

const ThemeSwitcher = () => {
  const { mode, setMode } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const current = THEME_OPTIONS.find((t) => t.mode === mode) ?? THEME_OPTIONS[0];

  return (
    <>
      <Tooltip title="Change theme">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Change theme"
          sx={{ color: "text.secondary" }}
        >
          {current.icon}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {THEME_OPTIONS.map((option) => (
          <MenuItem
            key={option.mode}
            selected={option.mode === mode}
            onClick={() => {
              setMode(option.mode);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText primary={option.label} />
            {option.mode === mode && (
              <CheckRoundedIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeSwitcher;
