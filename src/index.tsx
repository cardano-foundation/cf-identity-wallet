import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./ui/App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { store } from "./store";
import { ConfigurationService } from "./core/configuration";

await new ConfigurationService().start();
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();
