import React from "react";
import { setupIonicReact, IonApp } from "@ionic/react";
import Routes from "./routes";
import "./styles/ionic.scss";
import "./App.css";


setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <Routes />
    </IonApp>
  );
};

export default App;
