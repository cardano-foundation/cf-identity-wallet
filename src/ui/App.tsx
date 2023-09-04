import { StrictMode, useEffect, useState } from "react";
import { arrowBackOutline } from "ionicons/icons";
import {
  setupIonicReact,
  IonApp,
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonHeader,
} from "@ionic/react";
import { Routes } from "../routes";
import "./styles/ionic.scss";
import "./styles/style.scss";
import { AppWrapper } from "./components/AppWrapper";
import { Scanner } from "./components/Scanner";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getCurrentOperation,
  setCurrentOperation,
} from "../store/reducers/stateCache";

setupIonicReact();

const App = () => {
  const dispatch = useAppDispatch();
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
            <IonPage
              className="qr-code-scanner-full-page"
              data-testid="qr-code-scanner-full-page"
            >
              <IonHeader
                translucent={true}
                className="ion-no-border page-header"
              >
                <IonToolbar color="transparent">
                  <IonButtons slot="start">
                    <IonButton
                      slot="icon-only"
                      fill="clear"
                      onClick={() => {
                        setShowScan(false);
                        dispatch(setCurrentOperation(""));
                        document
                          ?.querySelector(
                            "body.scanner-active > div:last-child"
                          )
                          ?.classList.add("hide");
                      }}
                      className="back-button"
                      data-testid="back-button"
                    >
                      <IonIcon
                        icon={arrowBackOutline}
                        color="primary"
                      />
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <Scanner />
            </IonPage>
          ) : (
            <Routes />
          )}
        </StrictMode>
      </AppWrapper>
    </IonApp>
  );
};

export { App };
