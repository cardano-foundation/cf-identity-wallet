import { ScreenOrientation } from "@capacitor/screen-orientation";
import { StatusBar, Style } from "@capacitor/status-bar";
import {
  getPlatforms,
  IonApp,
  IonSpinner,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { StrictMode, useEffect, useState } from "react";
import { RoutePath, Routes } from "../routes";
import { PublicRoutes, TabsRoutePath } from "../routes/paths";
import { useAppSelector } from "../store/hooks";
import {
  getAuthentication,
  getCurrentOperation,
  getCurrentRoute,
  getIsInitialized,
  getIsOnline,
} from "../store/reducers/stateCache";
import "./App.scss";
import { AppOffline } from "./components/AppOffline";
import { AppWrapper } from "./components/AppWrapper";
import { ToastStack } from "./components/CustomToast/ToastStack";
import { GenericError } from "./components/Error";
import { SetUserName } from "./components/SetUserName";
import { SidePage } from "./components/SidePage";
import { OperationType } from "./globals/types";
import { FullPageScanner } from "./pages/FullPageScanner";
import { LoadingPage } from "./pages/LoadingPage/LoadingPage";
import { LockPage } from "./pages/LockPage/LockPage";
import "./styles/ionic.scss";
import "./styles/style.scss";

setupIonicReact();

const App = () => {
  const initialized = useAppSelector(getIsInitialized);
  const isOnline = useAppSelector(getIsOnline);
  const authentication = useAppSelector(getAuthentication);
  const currentRoute = useAppSelector(getCurrentRoute);
  const [showSetUserName, setShowSetUserName] = useState(false);
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showScan, setShowScan] = useState(false);

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
  }, [currentOperation]);

  useEffect(() => {
    if (
      authentication.loggedIn &&
      (authentication.userName === undefined ||
        authentication.userName?.length === 0) &&
      currentRoute?.path?.includes(TabsRoutePath.ROOT)
    ) {
      setShowSetUserName(true);
    }
  }, [authentication.loggedIn, authentication.userName, currentRoute]);

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
      <IonReactRouter>
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
        <div className={showScan ? "ion-hide" : ""}>
          <Routes />
        </div>
      </IonReactRouter>
    );
  };

  const isPublicPage = PublicRoutes.includes(currentRoute?.path as RoutePath);

  return (
    <IonApp>
      <AppWrapper>
        <StrictMode>
          {initialized ? (
            <>
              {renderApp()}
              {!isPublicPage && !authentication.loggedIn ? <LockPage /> : null}
              {authentication.ssiAgentIsSet && !isOnline ? (
                <AppOffline />
              ) : null}
            </>
          ) : (
            <LoadingPage />
          )}
          <SetUserName
            isOpen={showSetUserName}
            setIsOpen={setShowSetUserName}
          />
          <SidePage />
          <GenericError />
          <ToastStack />
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
