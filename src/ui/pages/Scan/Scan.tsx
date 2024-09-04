import { IonButton, IonIcon, useIonViewWillEnter } from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { repeatOutline } from "ionicons/icons";
import { getNextRoute } from "../../../routes/nextRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  getStateCache,
  getToastMsg,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { TabLayout } from "../../components/layout/TabLayout";
import { Scanner } from "../../components/Scanner";
import { OperationType } from "../../globals/types";
import "./Scan.scss";
import { useCameraDirection } from "../../components/Scanner/hook/useCameraDirection";

const Scan = () => {
  const pageId = "scan-tab";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentToastMsg = useAppSelector(getToastMsg);
  const [isValueCaptured, setIsValueCaptured] = useState(false);
  const { cameraDirection, changeCameraDirection, supportMultiCamera } =
    useCameraDirection();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.SCAN }));
  });

  useEffect(() => {
    if (isValueCaptured) {
      const data: DataProps = {
        store: { stateCache },
        state: {
          currentOperation: currentOperation,
          toastMsg: currentToastMsg,
        },
      };

      const { nextPath, updateRedux } = getNextRoute(TabsRoutePath.SCAN, data);
      updateReduxState(nextPath.pathname, data, dispatch, updateRedux);

      const connectionScan =
        currentOperation === OperationType.RECEIVE_CONNECTION &&
        [TabsRoutePath.IDENTIFIERS, TabsRoutePath.CREDENTIALS].includes(
          nextPath.pathname as TabsRoutePath
        );

      history.push({
        pathname: nextPath.pathname,
        state: {
          ...data.state,
          openConnections: connectionScan,
        },
      });
      setIsValueCaptured(false);
    }
  }, [currentToastMsg, currentOperation, isValueCaptured]);

  const handleAfterScan = () => {
    history.push(TabsRoutePath.IDENTIFIERS);
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
        routePath={history.location.pathname}
        setIsValueCaptured={setIsValueCaptured}
        handleReset={handleAfterScan}
        cameraDirection={cameraDirection}
      />
    </TabLayout>
  );
};

export { Scan };
