import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useIonViewWillEnter } from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  getStateCache,
  getToastMsg,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { Scanner } from "../../components/Scanner";
import "./Scan.scss";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";

const Scan = () => {
  const pageId = "scan-tab";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentToastMsg = useAppSelector(getToastMsg);
  const [isValueCaptured, setIsValueCaptured] = useState(false);

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
      history.push({
        pathname: nextPath.pathname,
        state: data.state,
      });
      setIsValueCaptured(false);
    }
  }, [currentToastMsg, currentOperation, isValueCaptured]);

  return (
    <TabLayout
      pageId={pageId}
      header={false}
    >
      <Scanner setIsValueCaptured={setIsValueCaptured} />
    </TabLayout>
  );
};

export { Scan };
