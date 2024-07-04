import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import {
  getNotificationsCache,
  setNotificationsCache,
} from "../../../store/reducers/notificationsCache";
import { useAppIonRouter } from "../../hooks";
import { getBackRoute } from "../../../routes/backRoute";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { MultiSigRequest } from "./components/MultiSigRequest";
import { ReceiveCredential } from "./components/ReceiveCredential";
import { Agent } from "../../../core/agent/agent";

const NotificationDetails = () => {
  const pageId = "notification-details";
  const ionicRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const notificationsCache = useAppSelector(getNotificationsCache);
  const [notifications, setNotifications] = useState(notificationsCache);
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

  const handleNotificationDelete = async (id: string) => {
    await Agent.agent.signifyNotifications.deleteNotificationRecordById(id);
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id
    );
    setNotifications(updatedNotifications);
    dispatch(setNotificationsCache(updatedNotifications));
  };

  return (
    <>
      {!!notificationDetails &&
        notificationDetails.a.r === NotificationRoute.MultiSigIcp && (
        <MultiSigRequest
          pageId={pageId}
          activeStatus={!!notificationDetails}
          notificationDetails={notificationDetails}
          handleBack={handleBack}
          handleNotificationDelete={handleNotificationDelete}
        />
      )}
      {!!notificationDetails &&
        notificationDetails.a.r === NotificationRoute.ExnIpexGrant && (
        <ReceiveCredential
          pageId={pageId}
          activeStatus={!!notificationDetails}
          notificationDetails={notificationDetails}
          handleBack={handleBack}
          handleNotificationDelete={handleNotificationDelete}
        />
      )}
    </>
  );
};

export { NotificationDetails };
