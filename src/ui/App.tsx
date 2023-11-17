import { StrictMode, useEffect, useState } from "react";
import { setupIonicReact, IonApp, IonToast } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import { AppWrapper } from "./components/AppWrapper";
import {
  getCurrentOperation,
  getToastMsg,
  setToastMsg,
} from "../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { FullPageScanner } from "./pages/FullPageScanner";
import { OperationType } from "./globals/types";
import { i18n } from "../i18n";
import { ConnectionCredentialRequest } from "./pages/ConnectionRequest";

setupIonicReact();

const App = () => {
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const toastMsg = useAppSelector(getToastMsg);
  const [showScan, setShowScan] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowScan(currentOperation === OperationType.SCAN_CONNECTION);
    setShowToast(toastMsg !== undefined);
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
          <ConnectionCredentialRequest />
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => {
              setShowToast(false);
              dispatch(setToastMsg());
            }}
            message={
              toastMsg ? `${i18n.t("toast." + toastMsg.toLowerCase())}` : ""
            }
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
