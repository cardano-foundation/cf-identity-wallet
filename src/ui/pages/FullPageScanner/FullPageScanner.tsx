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
import {
  getCurrentOperation,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  FullPageScannerProps,
  ScannerRefComponent,
} from "./FullPageScanner.types";
import { OperationType } from "../../globals/types";
import "./FullPageScanner.scss";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";
import { PageFooter } from "../../components/PageFooter";
import { i18n } from "../../../i18n";

const FullPageScanner = ({ showScan, setShowScan }: FullPageScannerProps) => {
  const pageId = "qr-code-scanner-full-page";
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const scannerRef = useRef<ScannerRefComponent>(null);

  useEffect(() => {
    document?.querySelector("body")?.classList.add("full-page-scanner");
  }, []);

  const handleReset = () => {
    setShowScan(false);
    dispatch(setCurrentOperation(OperationType.IDLE));
    scannerRef.current?.stopScan();
    document?.querySelector("body")?.classList.remove("full-page-scanner");
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.add("hide");
  };

  const handlePrimaryButtonAction = () => {
    //
  };

  const handleSecondaryButtonAction = () => {
    //
  };

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={showScan}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={handleReset}
          closeButtonIcon={arrowBackOutline}
        />
      }
    >
      <Scanner
        ref={scannerRef}
        handleReset={handleReset}
      />
      {currentOperation === OperationType.MULTI_SIG_INITIATOR_SCAN && (
        <PageFooter
          pageId={pageId}
          primaryButtonText={`${i18n.t("createidentifier.scan.initiate")}`}
          primaryButtonAction={() => handlePrimaryButtonAction()}
          secondaryButtonText={`${i18n.t("createidentifier.scan.pasteoobi")}`}
          secondaryButtonAction={() => handleSecondaryButtonAction()}
        />
      )}
      {currentOperation === OperationType.MULTI_SIG_RECEIVER_SCAN && (
        <PageFooter
          pageId={pageId}
          secondaryButtonText={`${i18n.t(
            "createidentifier.scan.pastecontents"
          )}`}
          secondaryButtonAction={() => handleSecondaryButtonAction()}
        />
      )}
    </ResponsivePageLayout>
  );
};

export { FullPageScanner };
