import { arrowBackOutline, repeatOutline } from "ionicons/icons";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";
import { Scanner } from "../../components/Scanner";
import { useCameraDirection } from "../../components/Scanner/hook/useCameraDirection";
import { BackEventPriorityType, OperationType } from "../../globals/types";
import "./FullPageScanner.scss";
import {
  FullPageScannerProps,
  ScannerRefComponent,
} from "./FullPageScanner.types";

const FullPageScanner = ({ showScan, setShowScan }: FullPageScannerProps) => {
  const { cameraDirection, changeCameraDirection, supportMultiCamera } =
    useCameraDirection();
  const pageId = "qr-code-scanner-full-page";
  const dispatch = useAppDispatch();
  const scannerRef = useRef<ScannerRefComponent>(null);

  useEffect(() => {
    document?.querySelector("body")?.classList.add("full-page-scanner");
  }, []);

  const handleReset = () => {
    setShowScan(false);
    scannerRef.current?.stopScan();
    document?.querySelector("body")?.classList.remove("full-page-scanner");
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.add("hide");
  };

  const handleCloseButton = () => {
    handleReset();
    setShowScan(false);
    dispatch(setCurrentOperation(OperationType.IDLE));
  };

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={showScan}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={handleCloseButton}
          closeButtonIcon={arrowBackOutline}
          hardwareBackButtonConfig={{
            prevent: !showScan,
            priority: BackEventPriorityType.Scanner,
          }}
          actionButton={supportMultiCamera}
          actionButtonIcon={repeatOutline}
          actionButtonAction={changeCameraDirection}
        />
      }
    >
      <Scanner
        ref={scannerRef}
        handleReset={handleReset}
        cameraDirection={cameraDirection}
      />
    </ResponsivePageLayout>
  );
};

export { FullPageScanner };
