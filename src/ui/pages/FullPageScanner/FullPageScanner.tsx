import { arrowBackOutline, repeatOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useAppDispatch } from "../../../store/hooks";
import {
  setCurrentOperation,
  showConnections,
} from "../../../store/reducers/stateCache";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";
import { Scanner } from "../../components/Scanner";
import { useCameraDirection } from "../../components/Scanner/hook/useCameraDirection";
import {
  BackEventPriorityType,
  OperationType,
} from "../../globals/types";
import "./FullPageScanner.scss";
import {
  FullPageScannerProps,
  ScannerRefComponent,
} from "./FullPageScanner.types";
import { TabsRoutePath } from "../../../routes/paths";
import { showConnectWallet } from "../../../store/reducers/walletConnectionsCache";

const FullPageScanner = ({ showScan, setShowScan }: FullPageScannerProps) => {
  const pageId = "qr-code-scanner-full-page";
  const dispatch = useAppDispatch();
  const history = useHistory();
  const scannerRef = useRef<ScannerRefComponent>(null);
  const { cameraDirection, changeCameraDirection, supportMultiCamera } =
    useCameraDirection();
  const [enableCameraDirection, setEnableCameraDirection] = useState(false);

  useEffect(() => {
    document?.querySelector("body")?.classList.add("full-page-scanner");
  }, []);

  const handleReset = (navTo?: string) => {
    setShowScan(false);
    document?.querySelector("body")?.classList.remove("full-page-scanner");
    document
      ?.querySelector("body.scanner-active > div:last-child")
      ?.classList.add("hide");
    dispatch(setCurrentOperation(OperationType.IDLE));

    if (navTo === TabsRoutePath.MENU) {
      dispatch(showConnections(false));
      history.push(navTo);
      dispatch(dispatch(showConnectWallet(true)));
    }
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
          actionButtonDisabled={!enableCameraDirection}
        />
      }
    >
      <Scanner
        ref={scannerRef}
        handleReset={handleReset}
        cameraDirection={cameraDirection}
        onCheckPermissionFinish={setEnableCameraDirection}
      />
    </ResponsivePageLayout>
  );
};

export { FullPageScanner };
