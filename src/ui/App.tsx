import { StrictMode, useEffect, useMemo, useState } from "react";
import {
  setupIonicReact,
  IonApp,
  getPlatforms,
  IonSpinner,
} from "@ionic/react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { RoutePath, Routes } from "../routes";
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
import { SetUserName } from "./components/SetUserName";
import { PublicRoutes, TabsRoutePath } from "../routes/paths";
import { MobileHeaderPreview } from "./components/MobileHeaderPreview";
import { CustomToast } from "./components/CustomToast/CustomToast";
import { LockPage } from "./pages/LockPage/LockPage";
import { LoadingPage } from "./pages/LoadingPage/LoadingPage";
import { SidePage } from "./pages/SidePage";

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
    setShowScan(
      [
        OperationType.SCAN_CONNECTION,
        OperationType.SCAN_WALLET_CONNECTION,
        OperationType.MULTI_SIG_INITIATOR_SCAN,
        OperationType.MULTI_SIG_RECEIVER_SCAN,
        OperationType.SCAN_SSI_BOOT_URL,
        OperationType.SCAN_SSI_CONNECT_URL,
      ].includes(currentOperation)
    );
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
    const platforms = getPlatforms();
    if (!platforms.includes("mobileweb")) {
      ScreenOrientation.lock({ orientation: "portrait" });
      if (platforms.includes("ios")) {
        StatusBar.setStyle({
          style: Style.Light,
        });
      }

      return () => {
        ScreenOrientation.unlock();
      };
    }
  }, []);

  const renderApp = () => {
    return (
      <>
        {showScan ? (
          <FullPageScanner
            showScan={showScan}
            setShowScan={setShowScan}
          />
        ) : (
          <div
            className="app-spinner-container"
            data-testid="app-spinner-container"
          >
            <IonSpinner name="circular" />
          </div>
        )}
        {!showScan && isPreviewMode ? <MobileHeaderPreview /> : null}
        <div className={showScan ? "ion-hide" : ""}>
          <Routes />
        </div>
      </>
    );
  };

  const isPublicPage = PublicRoutes.includes(currentRoute?.path as RoutePath);

  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          {stateCache.initialized ? (
            <>
              {renderApp()}
              {!isPublicPage && !authentication.loggedIn ? <LockPage /> : null}
            </>
          ) : (
            <LoadingPage />
          )}
          <SetUserName
            isOpen={showSetUserName}
            setIsOpen={setShowSetUserName}
          />
          <CustomToast
            toastMsg={toastMsg}
            showToast={showToast}
            setShowToast={setShowToast}
          />
          <SidePage />
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
