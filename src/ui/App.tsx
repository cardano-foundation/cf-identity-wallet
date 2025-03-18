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
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { Routes } from "../routes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getCurrentOperation,
  getInitializationPhase,
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
import { SecureStorage } from "../core/storage";
import { compareVersion } from "./utils/version";
import {
  ANDROID_MIN_VERSION,
  IOS_MIN_VERSION,
  WEBVIEW_MIN_VERSION,
} from "./globals/constants";
import { InitializationPhase } from "../store/reducers/stateCache/stateCache.types";
import { getCssVariableValue } from "./utils/styles";
import { LoadingType } from "./pages/LoadingPage/LoadingPage.types";

setupIonicReact();

const App = () => {
  const initializationPhase = useAppSelector(getInitializationPhase);
  const currentOperation = useAppSelector(getCurrentOperation);
  const [showScan, setShowScan] = useState(false);
  const [isCompatible, setIsCompatible] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleUnknownPromiseError = (event: PromiseRejectionEvent) => {
      // prevent log error to console.
      event.preventDefault();
      event.promise.catch((e) => showError("Unhandled error", e, dispatch));
    };

    window.addEventListener("unhandledrejection", handleUnknownPromiseError);

    const handleUnknownError = (event: ErrorEvent) => {
      event.preventDefault();
      showError("Unhandled error", event.error, dispatch);
    };

    window.addEventListener("error", handleUnknownError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnknownPromiseError
      );
      window.removeEventListener("error", handleUnknownError);
    };
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

      if (platforms.includes("android")) {
        EdgeToEdge.setBackgroundColor({
          color: getCssVariableValue("--ion-color-neutral-200"),
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
          const notSupportedOS =
            compareVersion(info.osVersion, `${ANDROID_MIN_VERSION}`) < 0 ||
            compareVersion(info.webViewVersion, `${WEBVIEW_MIN_VERSION}`) < 0;
          const isKeyStoreSupported = await SecureStorage.isKeyStoreSupported();
          if (notSupportedOS || !isKeyStoreSupported) {
            setIsCompatible(false);
            return;
          }
        } else if (info.platform === "ios") {
          const notSupportedOS =
            compareVersion(info.osVersion, `${IOS_MIN_VERSION}`) < 0;
          const isKeyStoreSupported = await SecureStorage.isKeyStoreSupported();
          if (notSupportedOS || !isKeyStoreSupported) {
            setIsCompatible(false);
            return;
          }
        }
      }
      setIsCompatible(true);
    };

    checkCompatibility();
  }, []);

  const contentByInitPhase = (initPhase: InitializationPhase) => {
    switch (initPhase) {
    case InitializationPhase.PHASE_ZERO:
      return <LoadingPage />;
    case InitializationPhase.PHASE_ONE:
      return (
        <>
          <LoadingPage type={LoadingType.Splash} />
          <LockPage />
        </>
      );
    case InitializationPhase.PHASE_TWO:
      return (
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
            <LockPage />
          </IonReactRouter>
          <AppOffline />
        </>
      );
    }
  };

  const renderApp = () => {
    return (
      <>
        <AppWrapper>
          <StrictMode>
            {contentByInitPhase(initializationPhase)}
            <InputRequest />
            <SidePage />
            <GenericError />
            <NoWitnessAlert />
            <ToastStack />
          </StrictMode>
        </AppWrapper>
      </>
    );
  };

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
