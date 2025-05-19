import { IonIcon, IonItem, IonLabel } from "@ionic/react";
import { t } from "i18next";
import {
  documentOutline,
  ellipsisHorizontal,
  fingerPrintOutline,
  idCardOutline,
  personCircleOutline,
} from "ionicons/icons";
import { MouseEvent, useMemo } from "react";
import { Trans } from "react-i18next";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/services/keriaNotificationService.types";
import { ConfigurationService } from "../../../core/configuration";
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

  const notificationLabelText = useMemo(() => {
    const connectionName = connectionsCache?.[item.connectionId]?.label;

    switch (item.a.r) {
      case NotificationRoute.ExnIpexGrant:
        return t("tabs.notifications.tab.labels.exnipexgrant", {
          connection: connectionName || t("connections.unknown"),
        });
      case NotificationRoute.MultiSigIcp:
        return t("tabs.notifications.tab.labels.multisigicp", {
          connection:
            multisigConnectionsCache?.[item.connectionId]?.label ||
            t("connections.unknown"),
        });
      case NotificationRoute.ExnIpexApply: {
        if (
          item.groupReplied &&
          !item.groupInitiator &&
          item.groupInitiatorPre
        ) {
          const initiator = item.groupInitiatorPre
            ? multisigConnectionsCache[item.groupInitiatorPre].label
            : t("connections.unknown");
          return t("tabs.notifications.tab.labels.exnipexapplyproposed", {
            connection: connectionName || t("connections.unknown"),
            initiator,
          });
        }

        return t("tabs.notifications.tab.labels.exnipexapply", {
          connection: connectionName || t("connections.unknown"),
        });
      }
      case NotificationRoute.LocalAcdcRevoked:
        return t("tabs.notifications.tab.labels.exnipexgrantrevoke", {
          credential: item.a.credentialTitle,
        });
      case NotificationRoute.MultiSigExn:
        return t("tabs.notifications.tab.labels.multisigexn", {
          connection: connectionName || t("connections.unknown"),
        });
      case NotificationRoute.RemoteSignReq:
        return t("tabs.notifications.tab.labels.sign", {
          connection: connectionName || t("connections.unknown"),
        });
      case NotificationRoute.HumanReadableMessage:
        return item.a.m as string;
      case NotificationRoute.LocalConnectInstructions:
        return t("tabs.notifications.tab.labels.connectinstructions", {
          connection: connectionName || t("connections.unknown"),
        });
      default:
        return "";
    }
  }, [
    connectionsCache,
    item.a.credentialTitle,
    item.a.r,
    item.connectionId,
    item.groupInitiator,
    item.groupReplied,
    item.groupInitiatorPre,
    multisigConnectionsCache,
    item.a.m,
  ]);

  const referIcon = (item: KeriaNotification) => {
    switch (item.a.r) {
      case NotificationRoute.ExnIpexGrant:
      case NotificationRoute.ExnIpexApply:
        return idCardOutline;
      case NotificationRoute.MultiSigIcp:
        return fingerPrintOutline;
      case NotificationRoute.RemoteSignReq:
        return documentOutline;
      case NotificationRoute.LocalConnectInstructions:
        return personCircleOutline;
      default:
        return idCardOutline;
    }
  };

  const openOptionModal = (e: MouseEvent) => {
    e.stopPropagation();

    onOptionButtonClick(item);
  };

  const isLocalSign = [
    NotificationRoute.RemoteSignReq,
    NotificationRoute.LocalConnectInstructions,
  ].includes(item.a.r as NotificationRoute);

  return (
    <IonItem
      onClick={() => onClick(item)}
      className={`notifications-tab-item${item.read ? "" : " unread"}`}
      data-testid={`notifications-tab-item-${item.id}`}
    >
      <div className="notification-logo">
        {isLocalSign ? (
          <div className="sign-logo" />
        ) : ConfigurationService.env.features.notifications?.fallbackIcon ? (
          <div
            className="notifications-tab-item-logo card-fallback-logo"
            data-testid="notifications-tab-item-logo"
          >
            <IonIcon
              icon={personCircleOutline}
              color="light"
            />
          </div>
        ) : (
          <img
            src={KeriLogo}
            alt="notifications-tab-item-logo"
            className="notifications-tab-item-logo"
            data-testid="notifications-tab-item-logo"
          />
        )}
        <IonIcon
          src={referIcon(item)}
          size="small"
          className="notification-ref-icon"
        />
      </div>
      <IonLabel data-testid="notifications-tab-item-label">
        <Trans>{notificationLabelText}</Trans>
        <br />
        <span className="notifications-tab-item-time">
          {timeDifference(item.createdAt)[0]}
          {timeDifference(item.createdAt)[1]}
        </span>
      </IonLabel>
      {!isLocalSign && (
        <IonIcon
          aria-hidden="true"
          icon={ellipsisHorizontal}
          slot="end"
          className="notifications-tab-item-ellipsis"
          data-testid={`${item.id}-option-btn`}
          onClick={openOptionModal}
        />
      )}
    </IonItem>
  );
};

export { NotificationItem };
