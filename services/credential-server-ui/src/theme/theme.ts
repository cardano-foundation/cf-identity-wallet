import { createTheme } from "@mui/material/styles";

const rootStyle = getComputedStyle(document.documentElement);

const theme = createTheme({
  typography: {
    fontFamily: `"Manrope", sans-serif`,
    fontSize: 16,
    body1: {
      fontSize: 16,
      fontWeight: 600,
    },
    h2: {
      fontSize: 28,
    },
    h6: {
      fontSize: 24,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 610,
      md: 1000,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: rootStyle.getPropertyValue("--primary-color").trim(),
    },
    secondary: {
      main: rootStyle.getPropertyValue("--secondary-color").trim(),
    },
    background: {
      default: rootStyle.getPropertyValue("--background-color").trim(),
    },
    text: {
      primary: rootStyle.getPropertyValue("--text-color").trim(),
    },
  },
});

export { theme };
