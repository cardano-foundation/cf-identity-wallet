import { arrowBackOutline } from "ionicons/icons";
import {
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonHeader,
} from "@ionic/react";
import { Scanner } from "../../components/Scanner";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../store/hooks";
import { FullPageScannerProps } from "./FullPageScanner.types";

const FullPageScanner = ({ setShowScan }: FullPageScannerProps) => {
  const dispatch = useAppDispatch();

  return (
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
                  ?.querySelector("body.scanner-active > div:last-child")
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
  );
};

export { FullPageScanner };
