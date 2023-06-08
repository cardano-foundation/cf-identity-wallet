import { setupIonicReact, IonApp } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./style.scss";
import { AppWrapper } from "./components/AppWrapper";
import { BrowserRouter } from "react-router-dom";

setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <AppWrapper>
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
