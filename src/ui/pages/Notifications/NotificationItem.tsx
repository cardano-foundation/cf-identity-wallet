import { IonIcon, IonItem, IonLabel } from "@ionic/react";
import { t } from "i18next";
import {
  ellipsisHorizontal,
  fingerPrintOutline,
  idCardOutline,
} from "ionicons/icons";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { Agent } from "../../../core/agent/agent";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { MultiSigIcpRequestDetails } from "../../../core/agent/services/identifier.types";
import { useAppSelector } from "../../../store/hooks";
import { getConnectionsCache } from "../../../store/reducers/connectionsCache";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import { timeDifference } from "../../utils/formatters";
import { NotificationItemProps } from "./Notification.types";

const NotificationItem = ({
  item,
  onClick,
  onOptionButtonClick,
}: NotificationItemProps) => {
  const connectionsCache = useAppSelector(getConnectionsCache);
  const [notificationLabelText, setNotificationLabelText] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const connection = connectionsCache.filter(
    (connection) => connection.id === item.connectionId
  )[0]?.label;

  const notificationLabel = useCallback(
    (
      item: KeriaNotification,
      multisigIcpDetails?: MultiSigIcpRequestDetails
    ) => {
      switch (item.a.r) {
      case NotificationRoute.ExnIpexGrant:
        return t("notifications.tab.labels.exnipexgrant", {
          connection: connection,
        });
      case NotificationRoute.MultiSigIcp:
        return t("notifications.tab.labels.multisigicp", {
          connection: multisigIcpDetails?.sender?.label,
        });
      case NotificationRoute.ExnIpexApply:
        return t("notifications.tab.labels.exnipexapply", {
          connection: connection,
        });
      default:
        return "";
      }
    },
    [connection]
  );

  const fetchNotificationLabel = useCallback(
    (multiSigIcpDetails?: MultiSigIcpRequestDetails) => {
      const label = notificationLabel(item, multiSigIcpDetails);
      setNotificationLabelText(label);
      setLoading(false);
    },
    [item, notificationLabel]
  );

  useEffect(() => {
    const fetchData = async () => {
      if (item.a.r === NotificationRoute.MultiSigIcp) {
        const details = await Agent.agent.multiSigs.getMultisigIcpDetails(
          item.a.d as string
        );
        fetchNotificationLabel(details);
      } else {
        fetchNotificationLabel();
      }
    };

    fetchData();
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
