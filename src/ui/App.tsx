import React from "react";
import "./styles/ionic.scss";
import {setupIonicReact, IonApp} from '@ionic/react';
import Routes from "./routes";

setupIonicReact();

const App = () => {
  return (
      <IonApp>
        <Routes />
      </IonApp>
  );
}

export default App;
