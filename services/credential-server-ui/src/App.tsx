import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ConnectionsIssuer from "./pages/ConnectionsIssuerPage";
import { Container, CssBaseline, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ConnectionPage from "./pages/ConnectionPage";
import CredentialPage from "./pages/CredentialPage";
import { RequestCredential } from "./pages/RequestCredential";

export const MENU_ITEMS = [
  {
    key: "connections",
    label: "Connections",
    path: "/connections",
    component: <ConnectionPage />,
  },
  {
    key: "issue-credential",
    label: "Issue Credential",
    path: "/issue-credential",
    component: <CredentialPage />,
  },
  {
    key: "request-credential",
    label: "Request Credential",
    path: "/request-credential",
    component: <RequestCredential />,
  },
];

function App() {
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <NavBar />
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
          <Paper
            variant="outlined"
            sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
          >
            <Routes>
              <Route path="/" element={<ConnectionPage />} />
              <Route
                path="/connections-issuer"
                element={<ConnectionsIssuer />}
              />
              {MENU_ITEMS.map((item) => (
                <Route
                  key={item.key}
                  path={item.path}
                  element={item.component}
                />
              ))}
            </Routes>
          </Paper>
        </Container>
      </LocalizationProvider>
    </div>
  );
}

export default App;
