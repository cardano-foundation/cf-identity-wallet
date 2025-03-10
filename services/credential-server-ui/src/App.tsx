import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./layouts/Layout";
import { Connections } from "./pages/Connections";
import { Credentials } from "./pages/Credentials";
import { NoPage } from "./pages/NoPage";
import { Overview } from "./pages/Overview";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./styles/colors.scss";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/500.css";
import { theme } from "./theme/theme"; // Import the theme
import { SnackbarProvider } from "notistack";
import { WarningAmber, CheckCircleOutline, Close } from "@mui/icons-material";
import { closeSnackbar } from "notistack";
import { Container, IconButton } from "@mui/material";

const App = () => {
  const MAX_TOAST_MESSAGES = 10;
  const TOAST_MESSAGE_DURATION = 2000;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={MAX_TOAST_MESSAGES}
        autoHideDuration={TOAST_MESSAGE_DURATION}
        iconVariant={{
          success: <CheckCircleOutline />,
          error: <WarningAmber />,
        }}
        action={(snackbarId) => (
          <IconButton
            aria-label="actions"
            onClick={() => closeSnackbar(snackbarId)}
          >
            <Close />
          </IconButton>
        )}
      >
        <Container maxWidth="xl">
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={<Layout />}
              >
                <Route
                  index
                  element={<Overview />}
                />
                <Route
                  path="/connections"
                  element={<Connections />}
                />
                <Route
                  path="/credentials"
                  element={<Credentials />}
                />
                <Route
                  path="/notifications"
                  element={<Notifications />}
                />
                <Route
                  path="/settings"
                  element={<Settings />}
                />
                <Route
                  path="*"
                  element={<NoPage />}
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </Container>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export { App };
