import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { createAppTheme } from "./theme";
import type { AppThemeMode } from "./palette";

const STORAGE_KEY = "medvoice-theme-mode";

interface ThemeContextValue {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeContextValue | null>(null);

const readStoredMode = (): AppThemeMode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "hospitalBlue") return stored;
  } catch {
    /* ignore */
  }
  return "light";
};

export interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const [mode, setModeState] = useState<AppThemeMode>(readStoredMode);

  const setMode = useCallback((next: AppThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const contextValue = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppThemeProvider");
  return ctx;
};
