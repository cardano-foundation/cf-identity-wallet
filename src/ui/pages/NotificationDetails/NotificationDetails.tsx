import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { NotificationRoute } from "../../../core/agent/agent.types";
import { useAppSelector } from "../../../store/hooks";
import { getNotificationsCache } from "../../../store/reducers/notificationsCache";
import { useAppIonRouter } from "../../hooks";
import { CredentialRequest } from "./components/CredentialRequest";
import { MultiSigRequest } from "./components/MultiSigRequest";
import { ReceiveCredential } from "./components/ReceiveCredential";
import { TabsRoutePath } from "../../../routes/paths";

const NotificationDetails = () => {
  const pageId = "notification-details";
  const ionicRouter = useAppIonRouter();
  const notificationCache = useAppSelector(getNotificationsCache);
  const { id } = useParams<{ id: string }>();

  const notificationDetails = useMemo(() => {
    return notificationCache.find((notification) => notification.id === id);
  }, [id, notificationCache]);

  const handleBack = () => {
    ionicRouter.push(TabsRoutePath.NOTIFICATIONS, "back", "pop");
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
  case NotificationRoute.ExnIpexApply:
    return (
      <CredentialRequest
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
