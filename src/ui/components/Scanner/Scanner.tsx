import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { IonCol, IonGrid, IonIcon, IonRow, isPlatform } from "@ionic/react";
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
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { OperationType, ToastMsgType } from "../../globals/types";
import { Agent } from "../../../core/agent/agent";
import { ScannerProps } from "./Scanner.types";
import { KeriConnectionType } from "../../../core/agent/agent.types";
import { CreateIdentifier } from "../CreateIdentifier";
import { setMultiSigGroupCache } from "../../../store/reducers/identifiersCache";
import { MultiSigGroup } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import { PageFooter } from "../PageFooter";
import { ResponsiveModal } from "../layout/ResponsiveModal";
import { PageHeader } from "../PageHeader";
import { CustomInput } from "../CustomInput";

const Scanner = forwardRef(
  ({ setIsValueCaptured, handleReset }: ScannerProps, ref) => {
    const componentId = "scanner";
    const dispatch = useAppDispatch();
    const currentOperation = useAppSelector(getCurrentOperation);
    const currentToastMsg = useAppSelector(getToastMsg);
    const currentRoute = useAppSelector(getCurrentRoute);
    const [createIdentifierModalIsOpen, setCreateIdentifierModalIsOpen] =
      useState(false);
    const [pasteModalIsOpen, setPasteModalIsOpen] = useState(false);
    const [groupId, setGroupId] = useState("");
    const [pastedValue, setPastedValue] = useState("");

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
      setGroupId("");
    };

    useImperativeHandle(ref, () => ({
      stopScan,
    }));

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

    const processValue = async (content: string) => {
      stopScan();
      // @TODO - foconnor: instead of setting the optype to idle we should
      // have a loading screen with "waiting for server..." etc,
      // and it can update to an error if the QR is invalid with a re-scan btn
      dispatch(setCurrentOperation(OperationType.IDLE));
      // @TODO - foconnor: when above loading screen in place, handle invalid QR code
      const invitation = await Agent.agent.connections.receiveInvitationFromUrl(
        content
      );
      if (invitation.type === KeriConnectionType.NORMAL) {
        handleReset && handleReset();
        setIsValueCaptured && setIsValueCaptured(true);
        if (
          currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN ||
          currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN
        ) {
          const groupId = new URL(content).searchParams.get("groupId");
          groupId && updateConnections(groupId);
        }
      } else if (invitation.type === KeriConnectionType.MULTI_SIG_INITIATOR) {
        setGroupId(invitation.groupId);
        setCreateIdentifierModalIsOpen(true);
      }
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
        ((currentRoute?.path === TabsRoutePath.SCAN ||
          currentOperation === OperationType.SCAN_CONNECTION) &&
          currentToastMsg !== ToastMsgType.CONNECTION_REQUEST_PENDING &&
          currentToastMsg !== ToastMsgType.CREDENTIAL_REQUEST_PENDING) ||
        currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN ||
        currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN
      ) {
        initScan();
      } else {
        stopScan();
      }
    }, [currentOperation, currentRoute]);

    const handlePrimaryButtonAction = () => {
      // TODO: Add content to initiate Multi Sig
      console.log("click primary");
    };

    const handleSubmitPastedValue = () => {
      setPasteModalIsOpen(false);
      processValue(pastedValue);
      setPastedValue("");
    };

    const RenderPageFooter = () => {
      switch (currentOperation) {
        case OperationType.MULTI_SIG_INITIATOR_SCAN:
          return (
            <PageFooter
              pageId={componentId}
              primaryButtonText={`${i18n.t("createidentifier.scan.initiate")}`}
              primaryButtonAction={handlePrimaryButtonAction}
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
        </IonGrid>
        <CreateIdentifier
          modalIsOpen={createIdentifierModalIsOpen}
          setModalIsOpen={setCreateIdentifierModalIsOpen}
          groupId={groupId}
        />
        <ResponsiveModal
          modalIsOpen={pasteModalIsOpen}
          componentId={componentId + "-input-modal"}
          customClasses={componentId + "-input-modal"}
          onDismiss={() => setPasteModalIsOpen(false)}
        >
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("createidentifier.scan.cancel")}`}
            closeButtonAction={() => setPasteModalIsOpen(false)}
            title={
              currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN ||
              currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN
                ? `${i18n.t("createidentifier.scan.pasteoobi")}`
                : `${i18n.t("createidentifier.scan.pastecontents")}`
            }
            actionButton={true}
            actionButtonAction={handleSubmitPastedValue}
            actionButtonLabel={`${i18n.t("createidentifier.scan.confirm")}`}
          />
          <CustomInput
            dataTestId={`${componentId}-input`}
            autofocus={true}
            onChangeInput={setPastedValue}
            value={pastedValue}
          />
        </ResponsiveModal>
      </>
    );
  }
);

export { Scanner };
