import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./ui/App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { CapacitorFileSystem } from "./core/aries/capacitorFileSystem";

const fs = new CapacitorFileSystem();
//fs.write("abc/abc.txt", "hola mundo");
fs.delete("abc");


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();