import {
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
} from "@capacitor-mlkit/barcode-scanning";
import { Capacitor } from "@capacitor/core";
import {
  getPlatforms,
  IonCol,
  IonGrid,
  IonIcon,
  IonRow,
  IonSpinner,
} from "@ionic/react";
import { scanOutline } from "ionicons/icons";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import {
  KeriConnectionType
} from "../../../core/agent/agent.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { StorageMessage } from "../../../core/storage/storage.types";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getConnectionsCache,
  setMissingAliasUrl,
  setOpenConnectionId,
  updateOrAddMultisigConnectionCache
} from "../../../store/reducers/connectionsCache";
import {
  getMultiSigGroupCache,
  getScanGroupId,
  setMultiSigGroupCache,
  setOpenMultiSigId,
} from "../../../store/reducers/identifiersCache";
import { MultiSigGroup } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import { setBootUrl, setConnectUrl } from "../../../store/reducers/ssiAgent";
import {
  getCurrentOperation,
  getShowConnections,
  getToastMsgs,
  setCurrentOperation,
  setToastMsg,
  showConnections
} from "../../../store/reducers/stateCache";
import {
  setPendingConnection,
  showConnectWallet,
} from "../../../store/reducers/walletConnectionsCache";
import { OperationType, ToastMsgType } from "../../globals/types";
import { showError } from "../../utils/error";
import { combineClassNames } from "../../utils/style";
import { isValidConnectionUrl, isValidHttpUrl } from "../../utils/urlChecker";
import { CreateGroupIdentifier } from "../CreateGroupIdentifier";
import { CreateIdentifier } from "../CreateIdentifier";
import { CustomInput } from "../CustomInput";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { OptionModal } from "../OptionsModal";
import { PageFooter } from "../PageFooter";
import "./Scanner.scss";
import { ErrorMessage, ScannerProps } from "./Scanner.types";

const OPEN_CONNECTION_TIME = 250;

const Scanner = forwardRef(
  (
    {
      routePath,
      setIsValueCaptured,
      handleReset,
      onCheckPermissionFinish,
      cameraDirection = LensFacing.Back,
    }: ScannerProps,
    ref
  ) => {
    const componentId = "scanner";
    const platforms = getPlatforms();
    const dispatch = useAppDispatch();
    const multiSigGroupCache = useAppSelector(getMultiSigGroupCache);
    const connections = useAppSelector(getConnectionsCache);
    const isShowConnectionsModal = useAppSelector(getShowConnections);
    const currentOperation = useAppSelector(getCurrentOperation);
    const scanGroupId = useAppSelector(getScanGroupId);
    const currentToastMsgs = useAppSelector(getToastMsgs);
    const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
      useState(false);
    const [pasteModalIsOpen, setPasteModalIsOpen] = useState(false);
    const [groupId, setGroupId] = useState("");
    const [pastedValue, setPastedValue] = useState("");
    const [scanning, setScanning] = useState(false);
    const [permission, setPermisson] = useState(false);
    const [mobileweb, setMobileweb] = useState(false);
    const [scanUnavailable, setScanUnavailable] = useState(false);
    const [groupIdentifierOpen, setGroupIdentifierOpen] =
      useState(false);
    const [resumeMultiSig, setResumeMultiSig] =
        useState<IdentifierShortDetails | null>(null);
    const isHandlingQR = useRef(false);

    useEffect(() => {
      if (platforms.includes("mobileweb")) {
        setMobileweb(true);
      }
    }, [platforms]);

    const checkPermission = async () => {
      const status = await BarcodeScanner.checkPermissions();
      if (status.camera === "granted") {
        return true;
      }
      if (
        status.camera === "prompt" ||
        status.camera == "prompt-with-rationale"
      ) {
        return (await BarcodeScanner.requestPermissions()).camera === "granted";
      }
    };

    const stopScan = async () => {
      if (permission) {
        await BarcodeScanner.stopScan();
        await BarcodeScanner.removeAllListeners();
      }

      setScanning(false);
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
        dispatch(showConnectWallet(true));
        handleReset && handleReset(TabsRoutePath.MENU);
      } else {
        dispatch(setToastMsg(ToastMsgType.PEER_ID_ERROR));
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

      dispatch(setCurrentOperation(OperationType.IDLE));
      handleReset && handleReset();
    };

    const handleAfterScanMultisig = () => {
      dispatch(setCurrentOperation(OperationType.OPEN_MULTISIG_IDENTIFIER));
      handleReset?.();
    };

    const handleDuplicateConnectionError = async (
      e: Error,
      url: string,
      isMultisig: boolean
    ) => {
      let urlId: string | null = null;
      if (isMultisig) {
        urlId = new URL(url).searchParams.get("groupId");
      } else {
        urlId = e.message
          .replace(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG, "")
          .trim();
      }

      if (!urlId) {
        showError("Scanner Error:", e, dispatch, ToastMsgType.SCANNER_ERROR);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await initScan();
        return;
      }

      showError(
        "Scanner Error:",
        e,
        dispatch,
        ToastMsgType.DUPLICATE_CONNECTION
      );

      if (isMultisig) {
        // NOTE: Scan duplicate multisig on multisign page
        if (scanGroupId) {
          handleReset?.();
          dispatch(setCurrentOperation(OperationType.IDLE));
          return;
        }

        dispatch(setOpenMultiSigId(urlId));
        handleReset?.(TabsRoutePath.IDENTIFIERS);
        return;
      } else {
        dispatch(setOpenConnectionId(urlId));
        dispatch(showConnections(true));
      }

      handleReset?.();
    };

    const checkUrl = (url: string) => {
      const isMultiSigUrl = url.includes("groupId");
      const urlGroupId = new URL(url).searchParams.get("groupId");
      const openScanFromMultiSig = [
        OperationType.MULTI_SIG_INITIATOR_SCAN,
        OperationType.MULTI_SIG_RECEIVER_SCAN,
      ].includes(currentOperation);

      // NOTE: When user scan multisig connection on multisig page and group id of url not match with current connection page
      if (
        openScanFromMultiSig &&
        (!isMultiSigUrl || urlGroupId !== scanGroupId)
      ) {
        throw new Error(ErrorMessage.GROUP_ID_NOT_MATCH);
      }

      if (
        (!isMultiSigUrl && !isValidConnectionUrl(url)) ||
        (isMultiSigUrl && !isValidHttpUrl(url))
      ) {
        throw new Error(ErrorMessage.INVALID_CONNECTION_URL);
      }

      return true;
    };

    const resolveGroupOobi = async (content: string) => {
      try {
        checkUrl(content);

        const invitation = await Agent.agent.connections.connectByOobiUrl(
          content
        );

        if (invitation.type === KeriConnectionType.NORMAL) {
          setIsValueCaptured && setIsValueCaptured(true);

          const scanMultiSigByTab = routePath === TabsRoutePath.SCAN;

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
            } else {
              handleReset?.();
            }
          }
        }

        if (invitation.type === KeriConnectionType.MULTI_SIG_INITIATOR) {
          setGroupId(invitation.groupId);
          dispatch(updateOrAddMultisigConnectionCache(invitation.connection));
          setCreateIdentifierModalIsOpen(true);
          dispatch(setToastMsg(ToastMsgType.NEW_MULTI_SIGN_MEMBER));
        }

        dispatch(setCurrentOperation(OperationType.IDLE));
      } catch (e) {
        const errorMessage = (e as Error).message;

        if (
          errorMessage.includes(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG)
        ) {
          await handleDuplicateConnectionError(e as Error, content, true);
          return;
        }

        if (errorMessage.includes(ErrorMessage.GROUP_ID_NOT_MATCH)) {
          showError(
            "Scanner Error:",
            e,
            dispatch,
            ToastMsgType.GROUP_ID_NOT_MATCH_ERROR
          );
          handleReset?.();
          return;
        }

        throw e;
      } finally {
        isHandlingQR.current = false;
      }
    };

    const resolveConnectionOobi = async (content: string) => {
      // Adding a pending connection item to the UI.
      // This will be removed when the create connection process ends.
      const connectionName = new URL(content).searchParams.get("name");
      if (!connectionName) {
        setTimeout(() => {
          dispatch(setMissingAliasUrl(content));
        }, OPEN_CONNECTION_TIME);
        return;
      }

      try {
        const connectionId = new URL(content).pathname
          .split("/oobi/")
          .pop()?.split("/")[0];

        if(connectionId && connections[connectionId]) {
          throw new Error(`${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG}: ${connectionId}`);
        }

        await Agent.agent.connections.connectByOobiUrl(content);
      } catch (e) {
        const errorMessage = (e as Error).message;

        if (
          errorMessage.includes(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG)
        ) {
          await handleDuplicateConnectionError(e as Error, content, false);
          return;
        }

        showError("Scanner Error:", e, dispatch);
      } finally {
        isHandlingQR.current = false;
      }
    };

    const handleResolveOobi = async (content: string) => {
      const isMultisigUrl = content.includes("groupId");

      try {
        if (!isMultisigUrl) {
          checkUrl(content);
          resolveConnectionOobi(content);
          handleReset?.();
          setIsValueCaptured?.(true);
          return;
        }

        await resolveGroupOobi(content);
      } catch (e) {
        if (OperationType.SCAN_WALLET_CONNECTION === currentOperation) {
          dispatch(setToastMsg(ToastMsgType.PEER_ID_ERROR));
          handleReset?.();
          return;
        }

        showError("Scanner Error:", e, dispatch, ToastMsgType.SCANNER_ERROR);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await initScan();
      }
    };

    const processValue = async (content: string) => {
      await stopScan();

      if (/^b[1-9A-HJ-NP-Za-km-z]{33}/.test(content)) {
        handleConnectWallet(content);
        isHandlingQR.current = false;
        return;
      }

      if (
        [
          OperationType.SCAN_SSI_BOOT_URL,
          OperationType.SCAN_SSI_CONNECT_URL,
        ].includes(currentOperation)
      ) {
        handleSSIScan(content);
        isHandlingQR.current = false;
        return;
      }

      handleResolveOobi(content);
    };

    const initScan = async () => {
      if (Capacitor.isNativePlatform()) {
        const allowed = await checkPermission();
        setPermisson(!!allowed);
        onCheckPermissionFinish?.(!!allowed);

        if (allowed) {
          const listener = await BarcodeScanner.addListener(
            "barcodeScanned",
            async (result) => {
              await listener.remove();

              if(isHandlingQR.current) return;
              isHandlingQR.current = true;

              await processValue(result.barcode.rawValue);
            }
          );

          try {
            await BarcodeScanner.startScan({
              formats: [BarcodeFormat.QrCode],
              lensFacing: cameraDirection,
            });
          } catch (error) {
            showError("Error starting barcode scan:", error);
            setScanUnavailable(true);
            stopScan();
          }
        }

        document?.querySelector("body")?.classList.add("scanner-active");
        setScanning(true);
        document?.querySelector("body")?.classList.add("scanner-active");
        document
          ?.querySelector("body.scanner-active > div:last-child")
          ?.classList.remove("hide");
      }
    };

    useEffect(() => {
      const onLoad = async () => {
        if(routePath === TabsRoutePath.SCAN && (isShowConnectionsModal || createIdentifierModalIsOpen)) {
          await stopScan();
          return;
        }

        const isDuplicateConnectionToast = currentToastMsgs.some(
          (item) => ToastMsgType.DUPLICATE_CONNECTION === item.message
        );
        const isRequestPending = currentToastMsgs.some((item) =>
          [
            ToastMsgType.CONNECTION_REQUEST_PENDING,
            ToastMsgType.CREDENTIAL_REQUEST_PENDING,
          ].includes(item.message)
        );

        const isScanning = routePath === TabsRoutePath.SCAN ||
        [
          OperationType.SCAN_CONNECTION,
          OperationType.SCAN_WALLET_CONNECTION,
          OperationType.SCAN_SSI_BOOT_URL,
          OperationType.SCAN_SSI_CONNECT_URL,
        ].includes(currentOperation);

        const isMultisignScan = [
          OperationType.MULTI_SIG_INITIATOR_SCAN,
          OperationType.MULTI_SIG_RECEIVER_SCAN,
        ].includes(currentOperation) && !isDuplicateConnectionToast;

        if ((isScanning && !isRequestPending) || isMultisignScan) {
          await initScan();
        } else {
          await stopScan();
        }
      };
      onLoad();
    }, [currentOperation, routePath, cameraDirection, isShowConnectionsModal, createIdentifierModalIsOpen, currentToastMsgs]);

    useEffect(() => {
      return () => {
        stopScan();
      };
    }, []);

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

    const handleCloseCreateIdentifier = (identifier?: IdentifierShortDetails) => {
      if(identifier?.groupMetadata || identifier?.multisigManageAid) {
        setResumeMultiSig(identifier);
        setGroupIdentifierOpen(true);
      }
    };

    const openPasteModal = () => setPasteModalIsOpen(true);

    const RenderPageFooter = () => {
      switch (currentOperation) {
      case OperationType.SCAN_WALLET_CONNECTION:
        return (
          <PageFooter
            customClass="actions-button"
            secondaryButtonAction={openPasteModal}
            secondaryButtonText={`${i18n.t("tabs.scan.pastemeerkatid")}`}
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
            secondaryButtonAction={openPasteModal}
          />
        );
      case OperationType.MULTI_SIG_RECEIVER_SCAN:
        return (
          <PageFooter
            pageId={componentId}
            secondaryButtonText={`${i18n.t(
              "createidentifier.scan.pasteoobi"
            )}`}
            secondaryButtonAction={openPasteModal}
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
            secondaryButtonAction={openPasteModal}
          />
        );
      }
    };

    const containerClass = combineClassNames("qr-code-scanner", {
      "no-permission": !permission || mobileweb,
      "scan-unavailable": scanUnavailable,
    });

    return (
      <>
        <IonGrid
          className={containerClass}
          data-testid="qr-code-scanner"
        >
          {scanning || mobileweb || scanUnavailable ? (
            <>
              <IonRow>
                <IonCol size="12">
                  <span className="qr-code-scanner-text">
                    {i18n.t("tabs.scan.tab.title")}
                  </span>
                </IonCol>
              </IonRow>
              <IonRow className="scan-icon">
                <IonIcon
                  icon={scanOutline}
                  color="light"
                  className="qr-code-scanner-icon"
                />
                <span className="qr-code-scanner-permission-text">
                  {scanUnavailable ? i18n.t("tabs.scan.tab.cameraunavailable") : i18n.t("tabs.scan.tab.permissionalert")}
                </span>
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
          onClose={handleCloseCreateIdentifier}
          groupId={groupId}
        />
        <CreateGroupIdentifier 
          modalIsOpen={groupIdentifierOpen} 
          setModalIsOpen={setGroupIdentifierOpen} 
          setResumeMultiSig={setResumeMultiSig} 
          resumeMultiSig={resumeMultiSig}
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
                  ? i18n.t(
                    "tabs.menu.tab.items.connectwallet.inputpidmodal.header"
                  )
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
