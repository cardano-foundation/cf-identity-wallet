import { IonIcon, IonItem, IonLabel } from "@ionic/react";
import { t } from "i18next";
import {
  ellipsisHorizontal,
  fingerPrintOutline,
  idCardOutline,
} from "ionicons/icons";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { Trans } from "react-i18next";
import {
  ExchangeRoute,
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { useAppSelector } from "../../../store/hooks";
import {
  getConnectionsCache,
  getMultisigConnectionsCache,
} from "../../../store/reducers/connectionsCache";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import { timeDifference } from "../../utils/formatters";
import { NotificationItemProps } from "./Notification.types";

const NotificationItem = ({
  item,
  onClick,
  onOptionButtonClick,
}: NotificationItemProps) => {
  const connectionsCache = useAppSelector(getConnectionsCache);
  const multisigConnectionsCache = useAppSelector(getMultisigConnectionsCache);
  const [notificationLabelText, setNotificationLabelText] =
    useState<string>("");
  const [loading, setLoading] = useState(true);

  const notificationLabel = useCallback(
    (item: KeriaNotification) => {
      switch (item.a.r) {
      case NotificationRoute.ExnIpexGrant:
        return t("notifications.tab.labels.exnipexgrant", {
          connection: connectionsCache?.[item.connectionId]?.label,
        });
      case NotificationRoute.MultiSigIcp:
        return t("notifications.tab.labels.multisigicp", {
          connection: multisigConnectionsCache?.[item.connectionId]?.label,
        });
      case NotificationRoute.ExnIpexApply:
        return t("notifications.tab.labels.exnipexapply", {
          connection: connectionsCache?.[item.connectionId]?.label,
        });
      case NotificationRoute.LocalAcdcRevoked:
        return t("notifications.tab.labels.exnipexgrantrevoke", {
          credential: item.a.credentialTitle,
        });
      case NotificationRoute.MultiSigExn:
        return t("notifications.tab.labels.multisigexn", {
          connection: connectionsCache?.[item.connectionId]?.label,
        });
      default:
        return "";
      }
    },
    [connectionsCache, multisigConnectionsCache]
  );

  const fetchNotificationLabel = useCallback(() => {
    const label = notificationLabel(item);

    setNotificationLabelText(label);
    setLoading(false);
  }, [item, notificationLabel]);

  useEffect(() => {
    fetchNotificationLabel();
  }, [fetchNotificationLabel, item]);

  const referIcon = (item: KeriaNotification) => {
    switch (item.a.r) {
    case NotificationRoute.ExnIpexGrant:
    case NotificationRoute.ExnIpexApply:
      return idCardOutline;
    case NotificationRoute.MultiSigIcp:
      return fingerPrintOutline;
    default:
      return idCardOutline;
    }
  };

  const openOptionModal = (e: MouseEvent) => {
    e.stopPropagation();

    onOptionButtonClick(item);
  };

  return (
    <>
      {!loading && (
        <IonItem
          onClick={() => onClick(item)}
          className={`notifications-tab-item${item.read ? "" : " unread"}`}
          data-testid={`notifications-tab-item-${item.id}`}
        >
          <div className="notification-logo">
            <img
              src={KeriLogo}
              alt="notifications-tab-item-logo"
              className="notifications-tab-item-logo"
              data-testid="notifications-tab-item-logo"
            />
            <IonIcon
              src={referIcon(item)}
              size="small"
              className="notification-ref-icon"
            />
          </div>
          <IonLabel>
            <Trans>{notificationLabelText}</Trans>
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
            data-testid={`${item.id}-option-btn`}
            onClick={openOptionModal}
          />
        </IonItem>
      )}
    </>
  );
};

export { NotificationItem };
