import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { KeriaNotification, NotificationRoute } from "../../../core/agent/agent.types";
import { TabsRoutePath } from "../../../routes/paths";
import { useAppSelector } from "../../../store/hooks";
import { getNotificationsCache } from "../../../store/reducers/notificationsCache";
import { useAppIonRouter } from "../../hooks";
import { CredentialRequest } from "./components/CredentialRequest";
import { MultiSigRequest } from "./components/MultiSigRequest";
import { ReceiveCredential } from "./components/ReceiveCredential";

const NotificationDetails = () => {
  const pageId = "notification-details";
  const ionicRouter = useAppIonRouter();
  const notificationCache = useAppSelector(getNotificationsCache);
  const { id } = useParams<{ id: string }>();

  const notificationDetails = useMemo(() => {
    return notificationCache.find((notification) => notification.id === id);
  }, [id, notificationCache]);

  const currentNotification = useRef<KeriaNotification | undefined>(notificationDetails);

  const handleBack = useCallback(() => {
    ionicRouter.push(TabsRoutePath.NOTIFICATIONS, "back", "pop");
  }, [ionicRouter]);

  const displayNotification = notificationDetails || currentNotification.current;

  useEffect(() => {
    if(!displayNotification) handleBack();
  }, [handleBack, displayNotification]);

  switch (displayNotification?.a?.r) {
  case NotificationRoute.MultiSigIcp:
    return (
      <MultiSigRequest
        pageId={pageId}
        activeStatus={!!displayNotification}
        notificationDetails={displayNotification}
        handleBack={handleBack}
      />
    );
  case NotificationRoute.ExnIpexGrant:
    return (
      <ReceiveCredential
        pageId={pageId}
        activeStatus={!!displayNotification}
        notificationDetails={displayNotification}
        handleBack={handleBack}
      />
    );
  case NotificationRoute.ExnIpexApply:
    return (
      <CredentialRequest
        pageId={pageId}
        activeStatus={!!displayNotification}
        notificationDetails={displayNotification}
        handleBack={handleBack}
      />
    );
  case NotificationRoute.MultiSigExn:
    return (
      <ReceiveCredential
        pageId={pageId}
        activeStatus={!!displayNotification}
        notificationDetails={displayNotification}
        handleBack={handleBack}
        multisigExn
      />
    );
  default:
    return null;
  }
};

export { NotificationDetails };
