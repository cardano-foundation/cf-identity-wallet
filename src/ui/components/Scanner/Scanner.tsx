import { forwardRef, useEffect, useImperativeHandle } from "react";
import { IonCol, IonGrid, IonIcon, IonRow, isPlatform } from "@ionic/react";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { scanOutline } from "ionicons/icons";
import "./Scanner.scss";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  getCurrentRoute,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { operationState, toastState } from "../../constants/dictionary";
import { AriesAgent } from "../../../core/agent/agent";

const Scanner = forwardRef((props, ref) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentRoute = useAppSelector(getCurrentRoute);

  const checkPermission = async () => {
    const status = await BarcodeScanner.checkPermission({ force: true });
    if (status.granted) {
      return true;
    }
    if (status.neverAsked) {
      const allow = confirm(`${i18n.t("scan.alert.title")}`);
      if (allow) {
        return true;
      }
    }
    return false;
  };

  const startScan = async () => {
    await BarcodeScanner.hideBackground();
    document?.querySelector("body")?.classList.add("scanner-active");
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.remove("hide");
    const result = await BarcodeScanner.startScan({
      targetedFormats: [SupportedFormat.QR_CODE],
    });
    return result;
  };

  const stopScan = async () => {
    await BarcodeScanner.stopScan();
    await BarcodeScanner.showBackground();
    document?.querySelector("body")?.classList.remove("scanner-active");
  };

  useImperativeHandle(ref, () => ({
    stopScan,
  }));

  const initScan = async () => {
    if (isPlatform("ios") || isPlatform("android")) {
      const allowed = await checkPermission();
      if (allowed) {
        document?.querySelector("body")?.classList.add("scanner-active");
        BarcodeScanner.hideBackground();
        const result = await startScan();
        if (result.hasContent) {
          stopScan();
          // @TODO: try catch and handle invalid QR code
          await AriesAgent.agent.connections.receiveInvitationFromUrl(
            result.content
          );
          if (result.content.includes("/oobi")) {
            // TODO: handle with better way
            history.push(TabsRoutePath.CREDS);
            setTimeout(() => {
              dispatch(setCurrentOperation(toastState.newConnectionAdded));
            }, 1000);
          }
          dispatch(setCurrentOperation(""));
        }
      }
    }
  };

  useEffect(() => {
    if (
      (currentRoute?.path === TabsRoutePath.SCAN ||
        currentOperation === operationState.scanConnection) &&
      currentOperation !== toastState.connectionRequestPending &&
      currentOperation !== toastState.credentialRequestPending
    ) {
      initScan();
    } else {
      stopScan();
    }
  }, [currentOperation, currentRoute]);

  return (
    <>
      <IonGrid
        className="qr-code-scanner"
        data-testid="qr-code-scanner"
      >
        <IonRow>
          <IonCol size="12">
            <span className="qr-code-scanner-text">
              {i18n.t("scan.tab.title")}
            </span>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonIcon
            icon={scanOutline}
            color="light"
            className="qr-code-scanner-icon"
          />
        </IonRow>
      </IonGrid>
    </>
  );
});

export { Scanner };
