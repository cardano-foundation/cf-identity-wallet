import { IonItem, IonLabel, IonIcon } from "@ionic/react";
import { ellipsisHorizontal } from "ionicons/icons";
import i18next from "i18next";
import { useEffect, useState } from "react";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import {
  getConnectionsCache,
  getMultisigConnectionsCache,
} from "../../../store/reducers/connectionsCache";
import { useAppSelector } from "../../../store/hooks";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
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
  const multisigConnectionsCache = useAppSelector(getMultisigConnectionsCache);
  const [notificationLabelText, setNotificationLabelText] =
    useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchNotificationLabel = async () => {
    const label = await notificationLabel(item);
    setNotificationLabelText(label);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotificationLabel();
  }, [item]);

  const notificationLabel = async (item: KeriaNotification) => {
    switch (item.a.r) {
    case NotificationRoute.ExnIpexGrant:
      return i18next.t("notifications.tab.labels.exnipexgrant", {
        connection: connectionsCache?.[item.connectionId]?.label,
      });
    case NotificationRoute.MultiSigIcp:
      return i18next.t("notifications.tab.labels.multisigicp", {
        connection: multisigConnectionsCache?.[item.connectionId]?.label,
      });
    case NotificationRoute.ExnIpexApply:
      return i18next.t("notifications.tab.labels.exnipexapply", {
        connection: connectionsCache?.[item.connectionId]?.label,
      });
    default:
      return "";
    }
  };

  return (
    <>
      {!loading && (
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
            {notificationLabelText}
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
      )}
    </>
  );
};

export { NotificationItem };
