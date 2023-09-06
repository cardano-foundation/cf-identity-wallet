import { StrictMode, useEffect, useState } from "react";
import { setupIonicReact, IonApp } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import { AppWrapper } from "./components/AppWrapper";
import { getCurrentOperation } from "../store/reducers/stateCache";
import { useAppSelector } from "../store/hooks";
import { FullPageScanner } from "./pages/FullPageScanner";

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
          {showScan ? (
            <FullPageScanner setShowScan={setShowScan} />
          ) : (
            <Routes />
          )}
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
