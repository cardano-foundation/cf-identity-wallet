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
import { IconButton } from "@mui/material";
import { ConnectionDetails } from "./pages/ConnectionDetails/ConnectionDetails";
import { useEffect } from "react";
import {
  fetchContactCredentials,
  fetchContacts,
} from "./store/reducers/connectionsSlice";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { RoutePath } from "./const/route";

const App = () => {
  const MAX_TOAST_MESSAGES = 10;
  const TOAST_MESSAGE_DURATION = 2000;

  const dispatch = useAppDispatch();
  const contacts = useAppSelector((state) => state.connections.contacts);

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  useEffect(() => {
    contacts.forEach((contact) => {
      dispatch(fetchContactCredentials(contact.id));
    });
  }, [contacts, dispatch]);

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
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Layout />}
            >
              {/* TODO: Bring back when we're ready to ship Overview */}
              {/* <Route
                index
                element={<Overview />}
              /> */}
              <Route
                index
                //path={RoutePath.Connections}
                element={<Connections />}
              />
              <Route
                path={RoutePath.ConnectionDetails}
                element={<ConnectionDetails />}
              />
              <Route
                path={RoutePath.Credentials}
                element={<Credentials />}
              />
              <Route
                path={RoutePath.Notifications}
                element={<Notifications />}
              />
              <Route
                path={RoutePath.Settings}
                element={<Settings />}
              />
              <Route
                path="*"
                element={<NoPage />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export { App };
