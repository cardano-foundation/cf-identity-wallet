import { Capacitor } from "@capacitor/core";
import { Device, DeviceInfo } from "@capacitor/device";
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
import { Routes } from "../routes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getCurrentOperation,
  getIsInitialized
} from "../store/reducers/stateCache";
import { AppOffline } from "./components/AppOffline";
import { AppWrapper } from "./components/AppWrapper";
import { ToastStack } from "./components/CustomToast/ToastStack";
import { GenericError, NoWitnessAlert } from "./components/Error";
import { InputRequest } from "./components/InputRequest";
import { SidePage } from "./components/SidePage";
import { OperationType } from "./globals/types";
import { FullPageScanner } from "./pages/FullPageScanner";
import { LoadingPage } from "./pages/LoadingPage/LoadingPage";
import { LockPage } from "./pages/LockPage/LockPage";
import "./styles/ionic.scss";
import "./styles/style.scss";
import "./App.scss";
import { showError } from "./utils/error";
import SystemCompatibilityAlert from "./pages/SystemCompatibilityAlert/SystemCompatibilityAlert";

setupIonicReact();

const App = () => {
  const initialized = useAppSelector(getIsInitialized);
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showScan, setShowScan] = useState(false);
  const [isCompatible, setIsCompatible] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<undefined | DeviceInfo>(undefined);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleUnknownPromiseError = (event: PromiseRejectionEvent) => {
      // prevent log error to console.
      event.preventDefault();
      event.promise.catch((e) => showError("Unhandled error", e, dispatch));
    }

    window.addEventListener("unhandledrejection", handleUnknownPromiseError);

    const handleUnknownError = (event: ErrorEvent) => {
      event.preventDefault();
      showError("Unhandled error", event.error, dispatch);
    }

    window.addEventListener("error", handleUnknownError)

    return () => {
      window.removeEventListener("unhandledrejection", handleUnknownPromiseError);
      window.removeEventListener("error", handleUnknownError);
    }
  }, [dispatch]);

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
    if (Capacitor.isNativePlatform()) {
      ScreenOrientation.lock({ orientation: "portrait" });

      const platforms = getPlatforms();
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

  useEffect(() => {
    const checkCompatibility = async () => {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        setDeviceInfo(info);

        if (info.platform === "android") {
          const androidVersion = parseFloat(info.osVersion);
          const webViewVersion = parseFloat(info.webViewVersion);
          if (androidVersion < 10.0 || webViewVersion < 79) {
            setIsCompatible(false);
            return;
          }
        } else if (info.platform === "ios") {
          const iosVersion = parseFloat(info.osVersion);
          if (iosVersion < 13) {
            setIsCompatible(false);
            return;
          }
        }
      }
      setIsCompatible(true);
    };

    checkCompatibility();
  }, []);



  const renderApp = () => {
    return <>
      <AppWrapper>
        <StrictMode>
          {initialized ? (
            <>
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
              <LockPage />
              <AppOffline />
            </>
          ) : (
            <LoadingPage />
          )}
          <InputRequest />
          <SidePage />
          <GenericError />
          <NoWitnessAlert />
          <ToastStack />
        </StrictMode>
      </AppWrapper>
    </>
  }
  return (
    <IonApp>
      {isCompatible ? (
        renderApp()
      ) : (
        <SystemCompatibilityAlert deviceInfo={deviceInfo} />
      )}
    </IonApp>
  );
};

export { App };
