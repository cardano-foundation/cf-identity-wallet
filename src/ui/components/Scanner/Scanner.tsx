import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  isPlatform,
} from "@ionic/react";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { scanOutline } from "ionicons/icons";
import "./Scanner.scss";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  getCurrentRoute,
  getToastMsg,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { OperationType, ToastMsgType } from "../../globals/types";
import { Agent } from "../../../core/agent/agent";
import { ScannerProps } from "./Scanner.types";
import { PasteConnectionPeerIdModal } from "../PasteConnectionPeerIdModal";
import { setPendingConnections } from "../../../store/reducers/walletConnectionsCache";
import { walletConnectionsFix } from "../../__fixtures__/walletConnectionsFix";
import { PageFooter } from "../PageFooter";

const Scanner = forwardRef(({ setIsValueCaptured }: ScannerProps, ref) => {
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentToastMsg = useAppSelector(getToastMsg);
  const currentRoute = useAppSelector(getCurrentRoute);

  const [openPidModal, setOpenPidModal] = useState<boolean>(false);

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

  const handleConnectWallet = (id: string) => {
    // TODO: Handle connect wallet
    dispatch(setToastMsg(ToastMsgType.PEER_ID_SUCCESS));
    dispatch(setPendingConnections(walletConnectionsFix[0]));
  };

  const handleConnect = (content: string) => {
    if (currentOperation === OperationType.SCAN_WALLET_CONNECTION) {
      handleConnectWallet(content);
      return;
    }

    Agent.agent.connections.connectByOobiUrl(content);
  };

  const handleSubmitConnect = (id: string) => {
    stopScan();
    dispatch(setCurrentOperation(OperationType.IDLE));
    handleConnectWallet(id);
  };

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
          // @TODO - sdisalvo: connectByOobiUrl should be awaited once we have error handling
          handleConnect(result.content);
          setIsValueCaptured && setIsValueCaptured(true);
        }
      }
    }
  };

  useEffect(() => {
    if (
      (currentRoute?.path === TabsRoutePath.SCAN ||
        [
          OperationType.SCAN_CONNECTION,
          OperationType.SCAN_WALLET_CONNECTION,
        ].includes(currentOperation)) &&
      currentToastMsg !== ToastMsgType.CONNECTION_REQUEST_PENDING &&
      currentToastMsg !== ToastMsgType.CREDENTIAL_REQUEST_PENDING
    ) {
      initScan();
    } else {
      stopScan();
    }
  }, [currentOperation, currentRoute]);

  const handlePasteMkId = () => {
    setOpenPidModal(true);
  };

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
        {OperationType.SCAN_WALLET_CONNECTION === currentOperation && (
          <PageFooter
            customClass="actions-button"
            secondaryButtonAction={handlePasteMkId}
            secondaryButtonText={`${i18n.t("scan.pastemeerkatid")}`}
          />
        )}
      </IonGrid>
      <PasteConnectionPeerIdModal
        openModal={openPidModal}
        onCloseModal={() => setOpenPidModal(false)}
        onConfirm={handleSubmitConnect}
      />
    </>
  );
});

export { Scanner };
