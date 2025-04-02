import { createTheme } from "@mui/material/styles";

const rootStyle = getComputedStyle(document.documentElement);

const MAX_WIDTH = "1536px";

const theme = createTheme({
  typography: {
    fontFamily: `"Manrope", sans-serif`,
    fontSize: 16,
    body1: {
      fontSize: 16,
      fontWeight: 600,
    },
    h1: {
      fontWeight: 700,
      fontSize: 28,
    },
    h2: {
      fontSize: 28,
    },
    h6: {
      fontSize: 24,
    },
    subtitle1: {
      fontSize: 12,
      fontWeight: 700,
    },
    body2: {
      fontSize: 16,
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          main: {
            maxWidth: MAX_WIDTH,
            margin: "0 auto",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "1rem",
          padding: "0.75rem 2.25rem",
          textTransform: "initial",
          fontWeight: 600,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "0.38rem 1rem",
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 744, // 744px is for iPad Mini (6th gen) in portrait view
      md: 1000,
      lg: 1200,
      xl: parseInt(MAX_WIDTH),
    },
  },
  palette: {
    primary: {
      main: rootStyle.getPropertyValue("--primary-color").trim(),
      light: rootStyle.getPropertyValue("--color-primary-200").trim(),
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
    error: {
      main: rootStyle.getPropertyValue("--color-error-800").trim(),
      contrastText: "#fff",
    },
    success: {
      main: rootStyle.getPropertyValue("--color-success-800").trim(),
      dark: rootStyle.getPropertyValue("--color-success-400").trim(),
      light: rootStyle.getPropertyValue("--color-success-100").trim(),
    },
  },
});

export { theme };
