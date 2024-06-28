import { IonItem, IonLabel, IonIcon } from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import i18next from "i18next";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";
import { useAppSelector } from "../../../store/hooks";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { i18n } from "../../../i18n";
import { timeDifference } from "../../utils/formatters";

const NotificationItem = ({
  item,
  index,
  handleNotificationClick,
}: {
  item: KeriaNotification;
  index: number;
  handleNotificationClick: (item: KeriaNotification) => void;
}) => {
  const connectionsCache = useAppSelector(getConnectionsCache);

  const notificationLabel = (item: KeriaNotification) => {
    const connection = connectionsCache.filter(
      (connection) => connection.id === item.connectionId
    )[0]?.label;
    // TODO: Implement different credential types
    const credential = i18n.t(
      "notifications.tab.credentialtypes.driverslicence"
    );
    switch (item.a.r) {
    case NotificationRoute.ExnIpexGrant:
      return i18next.t("notifications.tab.labels.exnipexgrant", {
        connection: connection,
        credential: credential,
      });
    case NotificationRoute.MultiSigIcp:
      return i18next.t("notifications.tab.labels.multisigicp", {
        connection: connection,
      });
    case NotificationRoute.ExnIpexApply:
      return i18next.t("notifications.tab.labels.exnipexapply", {
        connection: connection,
        credential: credential,
      });
    default:
      return "";
    }
  };

  return (
    <IonItem
      key={index}
      onClick={() => handleNotificationClick(item)}
      className={`notifications-tab-item${item.read ? "" : " unread"}`}
      data-testid={`notifications-tab-item-${index}`}
    >
      <img
        src={KeriLogo}
        alt="notifications-tab-item-logo"
        className="notifications-tab-item-logo"
        data-testid="notifications-tab-item-logo"
      />
      <IonLabel>
        {notificationLabel(item)}
        <br />
        <span className="notifications-tab-item-time">
          {timeDifference(item.createdAt)[0]}
          {timeDifference(item.createdAt)[1]}
        </span>
      </IonLabel>
      <IonIcon
        aria-hidden="true"
        icon={ellipsisHorizontal}
        slot="end"
        className="notifications-tab-item-ellipsis"
      />
    </IonItem>
  );
};

export { NotificationItem };
