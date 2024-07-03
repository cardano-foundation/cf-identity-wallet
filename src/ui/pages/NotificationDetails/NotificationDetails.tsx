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
import { CredentialRequest } from "./components/CredentialRequest";
import { MultiSigRequest } from "./components/MultiSigRequest";
import { ReceiveCredential } from "./components/ReceiveCredential";

const NotificationDetails = () => {
  const pageId = "notification-details";
  const ionicRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const notificationsData = useAppSelector(getNotificationsCache);
  const [notificationDetails, setNotificationDetails] =
    useState<KeriaNotification>(history?.location?.state as KeriaNotification);

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

  // if (loading.details || loading.history) {
  //   return (
  //     <div
  //       className="notification-detail-spinner-container"
  //       data-testid="notification-detail-spinner-container"
  //     >
  //       <IonSpinner name="circular" />
  //     </div>
  //   );
  // }

  return (
    <>
      {notificationDetails.a.r === NotificationRoute.ExnIpexApply && (
        <CredentialRequest
          notificationDetails={notificationDetails}
          handleBack={handleBack}
        />
      )}
      {notificationDetails.a.r === NotificationRoute.MultiSigIcp && (
        <MultiSigRequest
          notificationDetails={notificationDetails}
          handleBack={handleBack}
        />
      )}
      {notificationDetails.a.r === NotificationRoute.ExnIpexGrant && (
        <ReceiveCredential
          notificationDetails={notificationDetails}
          handleBack={handleBack}
        />
      )}
    </>
  );
};

export { NotificationDetails };
