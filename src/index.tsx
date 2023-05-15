import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./ui/App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { store } from "./store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

reportWebVitals();

async function start() {
  new Worker(new URL("./core/aries/agentWorker", import.meta.url));
}

start();
