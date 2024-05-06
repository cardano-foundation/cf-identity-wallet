import { StrictMode, useEffect, useMemo, useState } from "react";
import {
  setupIonicReact,
  IonApp,
  getPlatforms,
  IonSpinner,
} from "@ionic/react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";
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
  getStateCache,
  getToastMsg,
} from "../store/reducers/stateCache";
import { useAppSelector } from "../store/hooks";
import { FullPageScanner } from "./pages/FullPageScanner";
import { OperationType } from "./globals/types";
import { IncomingRequest } from "./pages/IncomingRequest";
import { SetUserName } from "./components/SetUserName";
import { TabsRoutePath } from "../routes/paths";
import { MobileHeaderPreview } from "./components/MobileHeaderPreview";
import { CustomToast } from "./components/CustomToast/CustomToast";
import { LockPage } from "./pages/LockPage/LockPage";

setupIonicReact();

const App = () => {
  const stateCache = useAppSelector(getStateCache);
  const authentication = useAppSelector(getAuthentication);
  const currentRoute = useAppSelector(getCurrentRoute);
  const [showSetUserName, setShowSetUserName] = useState(false);
  const currentOperation = useAppSelector(getCurrentOperation);
  const toastMsg = useAppSelector(getToastMsg);
  const [showScan, setShowScan] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lockIsRendered, setLockIsRendered] = useState(false);

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

  useEffect(() => {
    if (
      authentication.loggedIn &&
      (authentication.userName === undefined ||
        authentication.userName?.length === 0) &&
      currentRoute?.path?.includes(TabsRoutePath.ROOT)
    ) {
      setShowSetUserName(true);
    }
  }, [authentication.loggedIn, currentRoute]);

  useEffect(() => {
    ScreenOrientation.lock({ orientation: "portrait" });

    const platforms = getPlatforms();
    const isIosAppPlatform =
      platforms.includes("ios") && !platforms.includes("mobileweb");

    if (isIosAppPlatform) {
      StatusBar.setStyle({
        style: Style.Light,
      });
    }

    return () => {
      ScreenOrientation.unlock();
    };
  }, []);

  const renderApp = () => {
    if (!lockIsRendered && !stateCache.initialized) {
      // We need to include the LockModal in the loading page to track when is rendered
      return (
        <>
          <LockPage didEnter={() => setLockIsRendered(true)} />
          <div className="loading-page">
            <IonSpinner name="crescent" />
          </div>
        </>
      );
    } else if (showScan) {
      return <FullPageScanner setShowScan={setShowScan} />;
    } else {
      return (
        <>
          {isPreviewMode ? <MobileHeaderPreview /> : null}
          <Routes />
        </>
      );
    }
  };

  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          {lockIsRendered && !authentication.loggedIn ? <LockPage /> : null}
          {renderApp()}
          <SetUserName
            isOpen={showSetUserName}
            setIsOpen={setShowSetUserName}
          />
          <IncomingRequest />
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
