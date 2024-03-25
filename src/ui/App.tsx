import { StrictMode, useEffect, useMemo, useState } from "react";
import { setupIonicReact, IonApp, IonToast } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import "./App.scss";
import "./styles/smartphoneLayout.scss";
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
import { IncomingRequest } from "./pages/IncomingRequest";
import { Settings } from "./pages/Settings";
import { MobileHeaderPreview } from "./components/MobileHeaderPreview";

setupIonicReact();

const App = () => {
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const toastMsg = useAppSelector(getToastMsg);
  const [showScan, setShowScan] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isPreviewMode = useMemo(
    () => new URLSearchParams(window.location.search).has("browserPreview"),
    []
  );

  useEffect(() => {
    if (isPreviewMode) {
      setupIonicReact({
        rippleEffect: false,
        mode: "ios",
      });
      document?.querySelector("html")?.classList.add("smartphone-layout");
      document?.querySelector("body")?.classList.add("smartphone-content");
      const sidePanel = document.createElement("div");
      sidePanel.classList.add("side-panel");
      document?.querySelector("body")?.appendChild(sidePanel);
    }
  }, [isPreviewMode]);

  useEffect(() => {
    setShowScan(currentOperation === OperationType.SCAN_CONNECTION);
    setShowToast(toastMsg !== undefined);
  }, [currentOperation, toastMsg]);

  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          {showScan ? (
            <FullPageScanner setShowScan={setShowScan} />
          ) : (
            <>
              {isPreviewMode && <MobileHeaderPreview />}
              <Routes />
            </>
          )}

          <IncomingRequest />
          <Settings />
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
