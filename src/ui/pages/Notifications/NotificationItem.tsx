import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel } from "@ionic/react";
import { t } from "i18next";
import {
  ellipsisHorizontal,
  fingerPrintOutline,
  idCardOutline,
  mailOpenOutline,
  mailUnreadOutline,
  trashOutline
} from "ionicons/icons";
import { MouseEvent, useMemo } from "react";
import { Trans } from "react-i18next";
import {
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
import { combineClassNames } from "../../utils/style";

const NotificationItem = ({
  item,
  onClick,
  onOptionButtonClick,
  onDelete,
  onReadToggle
}: NotificationItemProps) => {
  const connectionsCache = useAppSelector(getConnectionsCache);
  const multisigConnectionsCache = useAppSelector(getMultisigConnectionsCache);
  
  const isComplete = false;

  const notificationLabelText = useMemo(() => {
    const connectionName = connectionsCache?.[item.connectionId]?.label;

    switch (item.a.r) {
    case NotificationRoute.ExnIpexGrant:
      return t("tabs.notifications.tab.labels.exnipexgrant", {
        connection: connectionName || t("connections.unknown"),
      });
    case NotificationRoute.MultiSigIcp:
      return t("tabs.notifications.tab.labels.multisigicp", {
        connection: multisigConnectionsCache?.[item.connectionId]?.label || t("connections.unknown"),
      });
    case NotificationRoute.ExnIpexApply: {
      if(item.groupReplied && !item.groupInitiator && item.initiatorAid) {
        const initiator = item.initiatorAid ? multisigConnectionsCache[item.initiatorAid].label :  t("connections.unknown");
        return t("tabs.notifications.tab.labels.exnipexapplyproposed", {
          connection: connectionName || t("connections.unknown"),
          initiator
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
    default:
      return "";
    }
  }, [connectionsCache, item.a.credentialTitle, item.a.r, item.connectionId, item.groupInitiator, item.groupReplied, item.initiatorAid, multisigConnectionsCache])

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

  const deleteNotification = () => {
    onDelete(item);
  };

  const itemClasses = combineClassNames("notifications-tab-item", {
    unread: !item.read,
    complete: isComplete
  })

  const onClickItem = () => {
    onClick(item);
  }

  return (
    <IonItemSliding className="notification-tab-item-slide">
      <IonItem
        onClick={onClickItem}
        className={itemClasses}
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
          {
            isComplete && <span className="complete"> • <span className="complete-label">{t("tabs.notifications.tab.complete")}</span></span>
          }
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
      <IonItemOptions onIonSwipe={deleteNotification}>
        {!isComplete && (
          <IonItemOption
            className="read-button"
            onClick={() => {
              onReadToggle(item)
            }}
            data-testid={`toogle-read-button-${item.id}`}
          >
            <div className="option-content">
              <IonIcon icon={item.read ? mailOpenOutline : mailUnreadOutline}/>
              <span>{item.read ? t("tabs.notifications.tab.button.unread") : t("tabs.notifications.tab.button.read")}</span>
            </div>
          </IonItemOption>
        )}
        <IonItemOption
          color="danger"
          onClick={deleteNotification}
          data-testid={`delete-button-${item.id}`}
          expandable
        >
          <div className="option-content">
            <IonIcon icon={trashOutline}/>
            <span>{t("tabs.notifications.tab.button.delete")}</span>
          </div>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

export { NotificationItem };
