import { StrictMode, useEffect, useState } from "react";
import { setupIonicReact, IonApp, IonPage } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import { AppWrapper } from "./components/AppWrapper";
import { Scanner } from "./components/Scanner";
import { useAppSelector } from "../store/hooks";
import { getCurrentOperation } from "../store/reducers/stateCache";

setupIonicReact();

const App = () => {
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showScan, setShowScan] = useState(false);

  useEffect(() => {
    setShowScan(currentOperation === "scan");
  }, [currentOperation]);

  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          <Routes />
          {showScan && (
            <IonPage data-testid="qr-code-scanner-full-page">
              <Scanner />
            </IonPage>
          )}
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
