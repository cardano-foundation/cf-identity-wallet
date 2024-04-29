import { arrowBackOutline } from "ionicons/icons";
import {
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonHeader,
} from "@ionic/react";
import { useEffect, useRef } from "react";
import { Scanner } from "../../components/Scanner";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../store/hooks";
import {
  FullPageScannerProps,
  ScannerRefComponent,
} from "./FullPageScanner.types";
import { OperationType } from "../../globals/types";
import "./FullPageScanner.scss";

const FullPageScanner = ({ setShowScan }: FullPageScannerProps) => {
  const dispatch = useAppDispatch();
  const scannerRef = useRef<ScannerRefComponent>(null);

  useEffect(() => {
    document?.querySelector("body")?.classList.add("full-page-scanner");
  }, []);

  const handleBackButton = () => {
    setShowScan(false);
    dispatch(setCurrentOperation(OperationType.IDLE));
    scannerRef.current?.stopScan();
    document?.querySelector("body")?.classList.remove("full-page-scanner");
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.add("hide");
  };
  return (
    <IonPage
      className="qr-code-scanner-full-page"
      data-testid="qr-code-scanner-full-page"
    >
      <IonHeader className="ion-no-border page-header">
        <IonToolbar color="transparent">
          <IonButtons slot="start">
            <IonButton
              slot="icon-only"
              fill="clear"
              onClick={() => handleBackButton()}
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
      <Scanner ref={scannerRef} />
    </IonPage>
  );
};

export { FullPageScanner };
