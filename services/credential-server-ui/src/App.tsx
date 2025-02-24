import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./layouts/Layout";
import { Connections } from "./pages/Connections";
import { Credentials } from "./pages/Credentials";
import { NoPage } from "./pages/NoPage";
import { Overview } from "./pages/Overview";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./styles/colors.scss";

const rootStyle = getComputedStyle(document.documentElement);

const theme = createTheme({
  typography: {
    fontFamily: `"Manrope", sans-serif`,
    fontSize: 16,
    fontWeightMedium: 600,
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
              path="connections"
              element={<Connections />}
            />
            <Route
              path="credentials"
              element={<Credentials />}
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
