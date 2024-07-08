import { useHistory } from "react-router-dom";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import { useAppIonRouter } from "../../hooks";
import { getBackRoute } from "../../../routes/backRoute";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { MultiSigRequest } from "./components/MultiSigRequest";
import { ReceiveCredential } from "./components/ReceiveCredential";

const NotificationDetails = () => {
  const pageId = "notification-details";
  const ionicRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const notificationDetails = history?.location?.state as KeriaNotification;

  const handleBack = () => {
    const data: DataProps = {
      store: { stateCache },
    };
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.NOTIFICATION_DETAILS,
      data
    );

    updateReduxState(backPath.pathname, data, dispatch, updateRedux);
    ionicRouter.goBack();
  };

  switch (notificationDetails?.a?.r) {
  case NotificationRoute.MultiSigIcp:
    return (
      <MultiSigRequest
        pageId={pageId}
        activeStatus={!!notificationDetails}
        notificationDetails={notificationDetails}
        handleBack={handleBack}
      />
    );
  case NotificationRoute.ExnIpexGrant:
    return (
      <ReceiveCredential
        pageId={pageId}
        activeStatus={!!notificationDetails}
        notificationDetails={notificationDetails}
        handleBack={handleBack}
      />
    );
  default:
    return null;
  }
};

export { NotificationDetails };
