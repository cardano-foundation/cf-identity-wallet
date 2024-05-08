import { arrowBackOutline } from "ionicons/icons";
import { useEffect, useRef } from "react";
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
    </ResponsivePageLayout>
  );
};

export { FullPageScanner };
