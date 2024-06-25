import { useState } from "react";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  useIonViewWillEnter,
} from "@ionic/react";
import { settingsOutline, ellipsisHorizontal } from "ionicons/icons";
import KeriLogo from "../../assets/images/KeriGeneric.jpg";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Notifications.scss";
import { i18n } from "../../../i18n";
import { timeDifference } from "../../utils/formatters";
import { Agent } from "../../../core/agent/agent";
import {
  NotificationResult,
  NotificationRoute,
} from "../../../core/agent/agent.types";

const Notifications = () => {
  const pageId = "notifications-tab";
  const dispatch = useAppDispatch();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [notifications, setNotifications] = useState<NotificationResult[]>([]);

  const notificationsNew = notifications.filter(
    (notification) =>
      timeDifference(notification.createdAt)[1] === "m" ||
      timeDifference(notification.createdAt)[1] === "h"
  );
  const notificationsEarlier = notifications.filter(
    (notification) =>
      timeDifference(notification.createdAt)[1] !== "h" &&
      timeDifference(notification.createdAt)[1] !== "m"
  );

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.NOTIFICATIONS }));
    getNotifications();
  });

  const handleNotificationsSettings = () => {
    // TODO: Implement settings
  };

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="notifications-settings-button"
        data-testid="notifications-settings-button"
        onClick={handleNotificationsSettings}
      >
        <IonIcon
          slot="icon-only"
          icon={settingsOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  const handleNotificationClick = async (id: string) => {
    // TODO: Implement signify readNotification
    // await Agent.agent.signifyNotifications.readNotification(id);
  };

  const getNotifications = async () => {
    const notifications =
      await Agent.agent.signifyNotifications.getAllNotifications();
    setNotifications(notifications);
  };

  const filterOptions = [
    { filter: "all", label: i18n.t("notifications.tab.chips.all") },
    {
      filter: "identifiers",
      label: i18n.t("notifications.tab.chips.identifiers"),
    },
    {
      filter: "credentials",
      label: i18n.t("notifications.tab.chips.credentials"),
    },
  ];

  const Chip = ({ filter, label }: { filter: string; label: string }) => (
    <span>
      <IonChip
        className={selectedFilter === filter ? "selected" : ""}
        onClick={() => setSelectedFilter(filter)}
      >
        {label}
      </IonChip>
    </span>
  );

  const notificationLabel = (item: NotificationResult) => {
    switch (item.a.r) {
    case NotificationRoute.ExnIpexGrant:
      return i18n.t("notifications.tab.chips.exn-ipex-grant");
    case NotificationRoute.MultiSigIcp:
      return i18n.t("notifications.tab.chips.multi-sig-icp");
    case NotificationRoute.MultiSigRot:
      return i18n.t("notifications.tab.chips.multi-sig-rot");
    case NotificationRoute.ExnIpexApply:
      return i18n.t("notifications.tab.chips.exn-ipex-apply");
    case NotificationRoute.ExnIpexAgree:
      return i18n.t("notifications.tab.chips.exn-ipex-agree");
    default:
      return "";
    }
  };

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      title={`${i18n.t("notifications.tab.header")}`}
      additionalButtons={<AdditionalButtons />}
    >
      <div className="notifications-tab-chips">
        {filterOptions.map((option) => (
          <Chip
            key={option.filter}
            filter={option.filter}
            label={option.label}
          />
        ))}
      </div>
      <div className="notifications-tab-content">
        {!!notificationsNew.length && (
          <div className="notifications-tab-section">
            <h3 className="notifications-tab-section-title">
              {i18n.t("notifications.tab.sections.new")}
            </h3>
            <IonList
              lines="none"
              data-testid="notifications-items"
            >
              {notificationsNew.map((item, index) => {
                return (
                  <IonItem
                    key={index}
                    onClick={() => handleNotificationClick(item.id)}
                    className="notifications-tab-item"
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
              })}
            </IonList>
          </div>
        )}
        {!!notificationsEarlier.length && (
          <div className="notifications-tab-section">
            <h3 className="notifications-tab-section-title">
              {i18n.t("notifications.tab.sections.earlier")}
            </h3>
            <IonList
              lines="none"
              data-testid="notifications-items"
            >
              {notificationsEarlier.map((item, index) => {
                return (
                  <IonItem
                    key={index}
                    onClick={() => handleNotificationClick(item.id)}
                    className="notifications-tab-item"
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
              })}
            </IonList>
          </div>
        )}
      </div>
    </TabLayout>
  );
};

export { Notifications };
