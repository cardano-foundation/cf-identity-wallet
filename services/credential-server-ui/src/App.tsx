import { BrowserRouter, Routes, Route } from "react-router";
import { Layout } from "./layouts/Layout";
import { Connections } from "./pages/Connections";
import { Credentials } from "./pages/Credentials";
import { NoPage } from "./pages/NoPage";
import { Overview } from "./pages/Overview";

const App = () => {
  return (
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
  );
};

export { App };
