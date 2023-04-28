import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./ui/App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { ArisAgent } from "./core/aries/agent";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

const agent = new ArisAgent();
agent.start();