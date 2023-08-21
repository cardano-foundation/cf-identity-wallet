import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./ui/App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { store } from "./store";
import { AriesAgent } from "./core/aries/ariesAgent";
import { LibP2p } from "./core/aries/transports/libp2p/libP2p";

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

AriesAgent.agent.start();
LibP2p.libP2p.start()
  .then(() => {
    AriesAgent.agent.setEndpoint(LibP2p.libP2p.peerId);
  })
  .catch((err) => {
    throw err;
  });