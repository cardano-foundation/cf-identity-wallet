import { StrictMode } from "react";
import { setupIonicReact, IonApp } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import { AppWrapper } from "./components/AppWrapper";

setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          <Routes />
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
