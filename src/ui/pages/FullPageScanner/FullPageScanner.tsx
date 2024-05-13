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
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { useAppDispatch } from "../../../store/hooks";
import {
  FullPageScannerProps,
  ScannerRefComponent,
} from "./FullPageScanner.types";
import { OperationType } from "../../globals/types";
import "./FullPageScanner.scss";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";

const FullPageScanner = ({ showScan, setShowScan }: FullPageScannerProps) => {
  const pageId = "qr-code-scanner-full-page";
  const dispatch = useAppDispatch();
  const scannerRef = useRef<ScannerRefComponent>(null);

  const handleBackButton = () => {
    setShowScan(false);
    dispatch(setCurrentOperation(OperationType.IDLE));
    scannerRef.current?.stopScan();
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.add("hide");
  };

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={showScan}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={handleBackButton}
          closeButtonIcon={arrowBackOutline}
        />
      }
    >
      <Scanner ref={scannerRef} />
    </ResponsivePageLayout>
  );
};

export { FullPageScanner };
