import { useEffect, useState } from "react";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  settingsOutline,
  ellipsisHorizontal,
  personCircleOutline,
} from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Notifications.scss";
import { i18n } from "../../../i18n";
import { NotificationsProps } from "./Notifications.types";
import { notificationsFix } from "../../__fixtures__/notificationsFix";
import { timeDifference } from "../../utils/formatters";

const Notifications = () => {
  const pageId = "notifications-tab";
  const dispatch = useAppDispatch();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const notificationsAll = notificationsFix;
  const [notifications, setNotifications] =
    useState<NotificationsProps[]>(notificationsAll);

  useEffect(() => {
    setNotifications(
      selectedFilter === "all"
        ? notificationsAll
        : notificationsAll.filter(
          (notification) => notification.type === selectedFilter
        )
    );
  }, [selectedFilter]);

  const notificationsNew = notifications.filter(
    (notification) => timeDifference(notification.timestamp)[1] === ("m" || "h")
  );
  const notificationsEarlier = notifications.filter(
    (notification) =>
      timeDifference(notification.timestamp)[1] !== "h" &&
      timeDifference(notification.timestamp)[1] !== "m"
  );

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.NOTIFICATIONS }));
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

  const handleNotificationClick = (index: number) => {
    // TODO: Implement notification page
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
    {
      filter: "connections",
      label: i18n.t("notifications.tab.chips.connections"),
    },
    {
      filter: "cardanoconnect",
      label: i18n.t("notifications.tab.chips.cardanoconnect"),
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
                    onClick={() => handleNotificationClick(index)}
                    className="notifications-tab-item"
                    data-testid={`notifications-tab-item-${index}`}
                  >
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.label}
                        className="notifications-tab-item-logo"
                        data-testid="notifications-tab-item-logo"
                      />
                    ) : (
                      <div
                        data-testid="notifications-tab-item-fallback-logo"
                        className="notifications-tab-item-logo notifications-tab-item-fallback-logo"
                      >
                        <IonIcon
                          icon={personCircleOutline}
                          color="light"
                        />
                      </div>
                    )}
                    <IonLabel>
                      {item.label}
                      <br />
                      <span className="notifications-tab-item-time">
                        {timeDifference(item.timestamp)[0]}
                        {timeDifference(item.timestamp)[1]}
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
                    onClick={() => handleNotificationClick(index)}
                    className="notifications-tab-item"
                    data-testid={`notifications-tab-item-${index}`}
                  >
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.label}
                        className="notifications-tab-item-logo"
                        data-testid="notifications-tab-item-logo"
                      />
                    ) : (
                      <div
                        data-testid="notifications-tab-item-fallback-logo"
                        className="notifications-tab-item-logo notifications-tab-item-fallback-logo"
                      >
                        <IonIcon
                          icon={personCircleOutline}
                          color="light"
                        />
                      </div>
                    )}
                    <IonLabel>
                      {item.label}
                      <br />
                      <span className="notifications-tab-item-time">
                        {timeDifference(item.timestamp)[0]}
                        {timeDifference(item.timestamp)[1]}
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
