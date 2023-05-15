import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./ui/App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

async function start() {
  new Worker(new URL("./core/aries/agentWorker", import.meta.url));
}

start();
