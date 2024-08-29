import {
  BarcodeScanner,
  CameraDirection,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import {
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  IonSpinner,
  isPlatform,
} from "@ionic/react";
import { scanOutline } from "ionicons/icons";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateOrAddMultisigConnectionCache } from "../../../store/reducers/connectionsCache";
import {
  getMultiSigGroupCache,
  setMultiSigGroupCache,
} from "../../../store/reducers/identifiersCache";
import { MultiSigGroup } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import { setBootUrl, setConnectUrl } from "../../../store/reducers/ssiAgent";
import {
  getCurrentOperation,
  getToastMsg,
  setCurrentOperation,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { setPendingConnection } from "../../../store/reducers/walletConnectionsCache";
import { OperationType, ToastMsgType } from "../../globals/types";
import { CreateIdentifier } from "../CreateIdentifier";
import { CustomInput } from "../CustomInput";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { OptionModal } from "../OptionsModal";
import { PageFooter } from "../PageFooter";
import "./Scanner.scss";
import { ScannerProps } from "./Scanner.types";

const Scanner = forwardRef(
  (
    {
      routePath,
      setIsValueCaptured,
      handleReset,
      cameraDirection = CameraDirection.BACK,
    }: ScannerProps,
    ref
  ) => {
    const componentId = "scanner";
    const dispatch = useAppDispatch();
    const multiSigGroupCache = useAppSelector(getMultiSigGroupCache);
    const currentOperation = useAppSelector(getCurrentOperation);
    const currentToastMsg = useAppSelector(getToastMsg);
    const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
      useState(false);
    const [pasteModalIsOpen, setPasteModalIsOpen] = useState(false);
    const [groupId, setGroupId] = useState("");
    const [pastedValue, setPastedValue] = useState("");
    const [scanning, setScanning] = useState(false);

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
      setScanning(true);
      await BarcodeScanner.hideBackground();
      document?.querySelector("body")?.classList.add("scanner-active");
      document
        ?.querySelector("body.scanner-active > div:last-child")
        ?.classList.remove("hide");
      const result = await BarcodeScanner.startScan({
        targetedFormats: [SupportedFormat.QR_CODE],
        cameraDirection: cameraDirection,
      });
      return result;
    };

    const stopScan = async () => {
      setScanning(false);
      await BarcodeScanner.stopScan();
      await BarcodeScanner.showBackground();
      document?.querySelector("body")?.classList.remove("scanner-active");
      setGroupId("");
    };

    useImperativeHandle(ref, () => ({
      stopScan,
    }));

    const handleConnectWallet = (id: string) => {
      if (/^b[1-9A-HJ-NP-Za-km-z]{33}/.test(id)) {
        dispatch(setToastMsg(ToastMsgType.PEER_ID_SUCCESS));
        dispatch(
          setPendingConnection({
            id,
          })
        );
        handleReset && handleReset();
      } else {
        dispatch(setToastMsg(ToastMsgType.PEER_ID_ERROR));
        handleReset && handleReset();
      }
    };

    const updateConnections = async (groupId: string) => {
      // TODO: We should avoid calling getMultisigLinkedContacts every time we scan a QR code,
      // ideally once the OOBI is resolved we can insert the connection details into Redux -
      // should change when we do scanner error handling

      const connections =
        await Agent.agent.connections.getMultisigLinkedContacts(groupId);
      const newMultiSigGroup: MultiSigGroup = {
        groupId,
        connections,
      };
      dispatch(setMultiSigGroupCache(newMultiSigGroup));
    };

    const handleSSIScan = (content: string) => {
      if (OperationType.SCAN_SSI_BOOT_URL === currentOperation) {
        dispatch(setBootUrl(content));
      }

      if (OperationType.SCAN_SSI_CONNECT_URL === currentOperation) {
        dispatch(setConnectUrl(content));
      }

      handleReset && handleReset();
    };

    const handleAfterScanMultisig = () => {
      dispatch(setCurrentOperation(OperationType.OPEN_MULTISIG_IDENTIFIER));
      handleReset?.();
    };

    const handleResolveOobi = async (content: string) => {
      try {
        const invitation = await Agent.agent.connections.connectByOobiUrl(
          content
        );

        if (invitation.type === KeriConnectionType.NORMAL) {
          handleReset && handleReset();
          setIsValueCaptured && setIsValueCaptured(true);

          const scanMultiSigByTab =
            routePath === TabsRoutePath.SCAN && content.includes("groupId");

          if (
            currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN ||
            currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN ||
            // Initiator scan member qr by normal scanner (scan tab)
            scanMultiSigByTab
          ) {
            const groupId = new URL(content).searchParams.get("groupId");
            groupId && updateConnections(groupId);
            dispatch(updateOrAddMultisigConnectionCache(invitation.connection));

            if (scanMultiSigByTab) {
              handleAfterScanMultisig();
            }
          }
        }

        if (invitation.type === KeriConnectionType.MULTI_SIG_INITIATOR) {
          setGroupId(invitation.groupId);
          dispatch(updateOrAddMultisigConnectionCache(invitation.connection));
          setCreateIdentifierModalIsOpen(true);
          dispatch(setToastMsg(ToastMsgType.NEW_MULTI_SIGN_MEMBER));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Scanner Error:", e);
        dispatch(setToastMsg(ToastMsgType.SCANNER_ERROR));
        initScan();
      }
    };

    const processValue = async (content: string) => {
      stopScan();
      // @TODO - foconnor: instead of setting the optype to idle we should
      // have a loading screen with "waiting for server..." etc,
      // and it can update to an error if the QR is invalid with a re-scan btn
      dispatch(setCurrentOperation(OperationType.IDLE));

      if (currentOperation === OperationType.SCAN_WALLET_CONNECTION) {
        handleConnectWallet(content);
        return;
      }

      if (
        [
          OperationType.SCAN_SSI_BOOT_URL,
          OperationType.SCAN_SSI_CONNECT_URL,
        ].includes(currentOperation)
      ) {
        handleSSIScan(content);
        return;
      }

      // @TODO - foconnor: when above loading screen in place, handle invalid QR code
      handleResolveOobi(content);
    };

    const initScan = async () => {
      if (isPlatform("ios") || isPlatform("android")) {
        const allowed = await checkPermission();

        if (allowed) {
          document?.querySelector("body")?.classList.add("scanner-active");
          BarcodeScanner.hideBackground();
          const result = await startScan();

          if (result.hasContent) {
            processValue(result.content);
          }
        }
      }
    };

    useEffect(() => {
      if (
        ((routePath === TabsRoutePath.SCAN ||
          [
            OperationType.SCAN_CONNECTION,
            OperationType.SCAN_WALLET_CONNECTION,
            OperationType.SCAN_SSI_BOOT_URL,
            OperationType.SCAN_SSI_CONNECT_URL,
          ].includes(currentOperation)) &&
          currentToastMsg !== ToastMsgType.CONNECTION_REQUEST_PENDING &&
          currentToastMsg !== ToastMsgType.CREDENTIAL_REQUEST_PENDING) ||
        currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN ||
        currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN
      ) {
        initScan();
      } else {
        stopScan();
      }
    }, [currentOperation, currentToastMsg, routePath, cameraDirection]);

    const handlePrimaryButtonAction = () => {
      stopScan();
      dispatch(setCurrentOperation(OperationType.MULTI_SIG_INITIATOR_INIT));
      handleReset && handleReset();
    };

    const handleSubmitPastedValue = () => {
      setPasteModalIsOpen(false);
      processValue(pastedValue);
      setPastedValue("");
    };

    const RenderPageFooter = () => {
      switch (currentOperation) {
      case OperationType.SCAN_WALLET_CONNECTION:
        return (
          <PageFooter
            customClass="actions-button"
            secondaryButtonAction={() => setPasteModalIsOpen(true)}
            secondaryButtonText={`${i18n.t("scan.pastemeerkatid")}`}
          />
        );
      case OperationType.MULTI_SIG_INITIATOR_SCAN:
        return (
          <PageFooter
            pageId={componentId}
            primaryButtonText={`${i18n.t("createidentifier.scan.initiate")}`}
            primaryButtonAction={handlePrimaryButtonAction}
            primaryButtonDisabled={!multiSigGroupCache?.connections.length}
            secondaryButtonText={`${i18n.t(
              "createidentifier.scan.pasteoobi"
            )}`}
            secondaryButtonAction={() => setPasteModalIsOpen(true)}
          />
        );
      case OperationType.MULTI_SIG_RECEIVER_SCAN:
        return (
          <PageFooter
            pageId={componentId}
            secondaryButtonText={`${i18n.t(
              "createidentifier.scan.pasteoobi"
            )}`}
            secondaryButtonAction={() => setPasteModalIsOpen(true)}
          />
        );
      case OperationType.SCAN_SSI_BOOT_URL:
      case OperationType.SCAN_SSI_CONNECT_URL:
        return <div></div>;
      default:
        return (
          <PageFooter
            pageId={componentId}
            secondaryButtonText={`${i18n.t(
              "createidentifier.scan.pastecontents"
            )}`}
            secondaryButtonAction={() => setPasteModalIsOpen(true)}
          />
        );
      }
    };
    return (
      <>
        <IonGrid
          className="qr-code-scanner"
          data-testid="qr-code-scanner"
        >
          {scanning ? (
            <>
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
              <RenderPageFooter />
            </>
          ) : (
            <div
              className="scanner-spinner-container"
              data-testid="scanner-spinner-container"
            >
              <IonSpinner name="circular" />
            </div>
          )}
        </IonGrid>
        <CreateIdentifier
          modalIsOpen={createIdentifierModalIsOpen}
          setModalIsOpen={setCreateIdentifierModalIsOpen}
          groupId={groupId}
        />
        <OptionModal
          modalIsOpen={pasteModalIsOpen}
          componentId={componentId + "-input-modal"}
          customClasses={componentId + "-input-modal"}
          onDismiss={() => setPasteModalIsOpen(false)}
          header={{
            closeButton: true,
            closeButtonAction: () => setPasteModalIsOpen(false),
            closeButtonLabel: `${i18n.t("createidentifier.scan.cancel")}`,
            title: `${
              currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN ||
              currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN
                ? `${i18n.t("createidentifier.scan.pasteoobi")}`
                : currentOperation === OperationType.SCAN_WALLET_CONNECTION
                  ? i18n.t("menu.tab.items.connectwallet.inputpidmodal.header")
                  : `${i18n.t("createidentifier.scan.pastecontents")}`
            }`,
            actionButton: true,
            actionButtonDisabled: !pastedValue,
            actionButtonAction: handleSubmitPastedValue,
            actionButtonLabel: `${i18n.t("createidentifier.scan.confirm")}`,
          }}
        >
          <CustomInput
            dataTestId={`${componentId}-input`}
            autofocus={true}
            onChangeInput={setPastedValue}
            value={pastedValue}
          />
        </OptionModal>
      </>
    );
  }
);

export { Scanner };
