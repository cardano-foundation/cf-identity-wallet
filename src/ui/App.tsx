import { StrictMode, useEffect, useState } from "react";
import { setupIonicReact, IonApp, IonToast } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import { AppWrapper } from "./components/AppWrapper";
import {
  getCurrentOperation,
  setCurrentOperation,
} from "../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { FullPageScanner } from "./pages/FullPageScanner";
import { toastState } from "./constants/dictionary";
import { i18n } from "../i18n";

setupIonicReact();

const App = () => {
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showScan, setShowScan] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowScan(currentOperation === "scan");
    setShowToast(Object.values(toastState).indexOf(currentOperation) > -1);
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
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => {
              setShowToast(false);
              dispatch(setCurrentOperation(""));
            }}
            message={`${i18n.t("toast." + currentOperation.toLowerCase())}`}
            color="secondary"
            position="top"
            cssClass="confirmation-toast"
            duration={1500}
          />
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
