import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ConnectionsIssuer from "./pages/ConnectionsIssuerPage";
import { Container, CssBaseline, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ConnectionPage } from "./pages/ConnectionPage";
import { CredentialPage } from "./pages/CredentialPage";
import { RequestCredential } from "./pages/RequestCredential";
import { RevocationPage } from "./pages/RevocationPage";
import { CreateSchemaPage } from "./pages/CreateSchemaPage";

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
  {
    key: "revocation",
    label: "Revoke Credential",
    path: "/revocation",
    component: <RevocationPage />,
  },
  {
    key: "create-schema",
    label: "Create Schema",
    path: "/create-schema",
    component: <CreateSchemaPage />,
  },
];

function App() {
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <NavBar />
        <Container
          component="main"
          maxWidth="md"
          sx={{ mb: 4 }}
        >
          <Routes>
            <Route
              path="/"
              element={<ConnectionPage />}
            />
            <Route
              path="/connections-issuer"
              element={<ConnectionsIssuer />}
            />
            {MENU_ITEMS.map((item) =>
              item.path === "/connections" ? (
                <Route
                  key={item.key}
                  path={item.path}
                  element={item.component}
                />
              ) : (
                <Route
                  key={item.key}
                  path={item.path}
                  element={
                    <Paper
                      variant="outlined"
                      sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
                    >
                      {item.component}
                    </Paper>
                  }
                />
              )
            )}
          </Routes>
        </Container>
      </LocalizationProvider>
    </div>
  );
}

export default App;
