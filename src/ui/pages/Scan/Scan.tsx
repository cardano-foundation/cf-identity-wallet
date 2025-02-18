import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { repeatOutline } from "ionicons/icons";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch } from "../../../store/hooks";
import {
  setCurrentRoute,
  showConnections,
} from "../../../store/reducers/stateCache";
import { TabLayout } from "../../components/layout/TabLayout";
import { Scanner } from "../../components/Scanner";
import "./Scan.scss";
import { useCameraDirection } from "../../components/Scanner/hook/useCameraDirection";

const Scan = () => {
  const pageId = "scan-tab";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [isValueCaptured, setIsValueCaptured] = useState(false);
  const { cameraDirection, changeCameraDirection, supportMultiCamera } =
    useCameraDirection();
  const [enableCameraDirection, setEnableCameraDirection] = useState(false);
  const [cameraKey, setCameraKey] = useState(cameraDirection);

  useEffect(() => {
    setCameraKey(cameraDirection); // Cambiar el estado derivado provoca un re-renderizado
  }, [cameraDirection]);

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.SCAN }));
  });

  useEffect(() => {
    if (isValueCaptured) {
      setIsValueCaptured(false);
    }
  }, [isValueCaptured]);

  const handleAfterScan = (navTo?: string) => {
    if (navTo) {
      history.push({
        pathname: navTo,
      });

      return;
    }

    dispatch(showConnections(true));
  };

  return (
    <TabLayout
      pageId={pageId}
      header={supportMultiCamera}
      additionalButtons={
        <IonButton
          shape="round"
          className="action-button"
          onClick={changeCameraDirection}
          data-testid="action-button"
          disabled={!enableCameraDirection}
        >
          <IonIcon
            slot="icon-only"
            icon={repeatOutline}
            color="secondary"
          />
        </IonButton>
      }
    >
      <Scanner
        key={cameraKey}
        routePath={history.location.pathname}
        setIsValueCaptured={setIsValueCaptured}
        handleReset={handleAfterScan}
        cameraDirection={cameraDirection}
        onCheckPermissionFinish={setEnableCameraDirection}
      />
    </TabLayout>
  );
};

export { Scan };
