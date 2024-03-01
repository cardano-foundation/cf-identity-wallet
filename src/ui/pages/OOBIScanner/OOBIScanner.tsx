import { arrowBackOutline } from "ionicons/icons";
import {
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonHeader,
} from "@ionic/react";
import { useRef } from "react";
import { Scanner } from "../../components/Scanner";
import { removeCurrentRoute } from "../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../store/hooks";
import { ScannerRefComponent } from "./OOBIScanner.types";
import "./OOBIScanner.scss";
import { useHistory } from "react-router-dom";
import { RoutePath } from "../../../routes";

const OOBIScanner = () => {
  const pageId = "oobi-qr-code-scanner";
  const dispatch = useAppDispatch();
  const history = useHistory();
  const scannerRef = useRef<ScannerRefComponent>(null);

  const handleBackButton = (oobiUrl: string) => {
    dispatch(removeCurrentRoute());
    history.push(RoutePath.TUNNEL_CONNECT, {
      oobiUrl,
    });
    scannerRef.current?.stopScan();
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.add("hide");
  };

  const handleOobi = (oobiURl: string) => {
    handleBackButton(oobiURl);
  };

  return (
    <IonPage
      className={`${pageId} qr-code-scanner-full-page`}
      data-testid={pageId}
    >
      <IonHeader className="ion-no-border page-header">
        <IonToolbar color="transparent">
          <IonButtons slot="start">
            <IonButton
              slot="icon-only"
              fill="clear"
              onClick={() => handleBackButton("")}
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
      <Scanner
        handleContent={(content: string) => handleOobi(content)}
        ref={scannerRef}
      />
    </IonPage>
  );
};

export { OOBIScanner };
