import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
  getToastMsg,
  setCurrentOperation,
  setQueueIncomingRequest,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { OperationType, ToastMsgType } from "../../globals/types";
import { Agent } from "../../../core/agent/agent";
import { ScannerProps } from "./Scanner.types";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";

const Scanner = forwardRef(({ setIsValueCaptured }: ScannerProps, ref) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentToastMsg = useAppSelector(getToastMsg);
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
          // @TODO - foconnor: instead of setting the optype to idle we should
          // have a loading screen with "waiting for server..." etc,
          // and it can update to an error if the QR is invalid with a re-scan btn
          dispatch(setCurrentOperation(OperationType.IDLE));
          // @TODO - foconnor: when above loading screen in place, handle invalid QR code
          // @TODO - sdisalvo: receiveInvitationFromUrl should be awaited once we have error handling
          const invitation =
            await Agent.agent.connections.receiveInvitationFromUrl(
              result.content
            );
          if (invitation.type === KeriConnectionType.NORMAL) {
            setIsValueCaptured && setIsValueCaptured(true);
          } else if (
            invitation.type === KeriConnectionType.MULTI_SIG_INITIATOR
          ) {
            dispatch(
              setQueueIncomingRequest({
                id: invitation.groupId,
                type: IncomingRequestType.MULTI_SIG_RECEIVE_INVITATION,
              })
            );
            dispatch(
              setCurrentOperation(OperationType.RECEIVE_MULTI_SIG_INVITATION)
            );
            history.push({
              pathname: TabsRoutePath.IDENTIFIERS,
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    if (
      (currentRoute?.path === TabsRoutePath.SCAN ||
        currentOperation === OperationType.SCAN_CONNECTION) &&
      currentToastMsg !== ToastMsgType.CONNECTION_REQUEST_PENDING &&
      currentToastMsg !== ToastMsgType.CREDENTIAL_REQUEST_PENDING
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
