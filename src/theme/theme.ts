import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1565C0",
    },
    secondary: {
      main: "#00ACC1",
    },
    background: {
      default: "#F5F7FA",
    },
  },

  typography: {
    fontFamily: "Roboto",
    h4: {
      fontWeight: 700,
    },
  },

  shape: {
    borderRadius: 12,
  },
});

export default theme;