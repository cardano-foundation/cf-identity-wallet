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

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
    </ThemeProvider>
  );
};

export { App };
