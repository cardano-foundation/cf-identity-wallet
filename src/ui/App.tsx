import { StrictMode, useEffect, useState } from "react";
import { setupIonicReact, IonApp } from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import "./App.scss";
import "./styles/smartphoneLayout.scss";
import { AppWrapper } from "./components/AppWrapper";
import {
  getAuthentication,
  getCurrentOperation,
  getCurrentRoute,
  getToastMsg,
} from "../store/reducers/stateCache";
import { useAppSelector } from "../store/hooks";
import { FullPageScanner } from "./pages/FullPageScanner";
import { OperationType } from "./globals/types";
import { IncomingRequest } from "./pages/IncomingRequest";
import { Settings } from "./pages/Settings";
import { SetUserName } from "./components/SetUserName";
import { TabsRoutePath } from "../routes/paths";
import CustomToast from "./components/CustomToast/CustomToast";

setupIonicReact();

const App = () => {
  const authentication = useAppSelector(getAuthentication);
  const currentRoute = useAppSelector(getCurrentRoute);
  const [showSetUserName, setShowSetUserName] = useState(false);
  const currentOperation = useAppSelector(getCurrentOperation);
  const toastMsg = useAppSelector(getToastMsg);
  const [showScan, setShowScan] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("browserPreview")) {
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
  }, []);

  useEffect(() => {
    setShowScan(currentOperation === OperationType.SCAN_CONNECTION);
    setShowToast(toastMsg !== undefined);
  }, [currentOperation, toastMsg]);

  useEffect(() => {
    if (
      authentication.userName?.length === 0 &&
      currentRoute?.path.includes(TabsRoutePath.ROOT)
    ) {
      setShowSetUserName(true);
    }
  }, [authentication, currentRoute]);

  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          {showScan ? (
            <FullPageScanner setShowScan={setShowScan} />
          ) : (
            <>
              <Routes />
              <SetUserName
                isOpen={showSetUserName}
                setIsOpen={setShowSetUserName}
              />
            </>
          )}

          <IncomingRequest />
          <Settings />
          <CustomToast
            toastMsg={toastMsg}
            showToast={showToast}
            setShowToast={setShowToast}
          />
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
