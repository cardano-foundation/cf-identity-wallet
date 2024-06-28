import { useState } from "react";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonList,
  useIonViewWillEnter,
} from "@ionic/react";
import { settingsOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Notifications.scss";
import { i18n } from "../../../i18n";
import { timeDifference } from "../../utils/formatters";
import { getNotificationsCache } from "../../../store/reducers/notificationsCache";
import { NotificationItem } from "./NotificationItem";
import { Agent } from "../../../core/agent/agent";
import { KeriaNotification } from "../../../core/agent/agent.types";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";

const Notifications = () => {
  const pageId = "notifications-tab";
  const dispatch = useAppDispatch();
  const history = useHistory();
  const stateCache = useAppSelector(getStateCache);
  const notifications = useAppSelector(getNotificationsCache);
  const [selectedFilter, setSelectedFilter] = useState("all");
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

  const handleNotificationClick = async (item: KeriaNotification) => {
    // TODO: implement click on notification
    // await Agent.agent.signifyNotifications.readNotification(id);
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(
      TabsRoutePath.NOTIFICATIONS,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    history.push({
      pathname: nextPath.pathname,
      state: item,
    });
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
        // TODO: Implement filters
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
          <div
            className="notifications-tab-section"
            data-testid="notifications-tab-section-new"
          >
            <h3 className="notifications-tab-section-title">
              {i18n.t("notifications.tab.sections.new")}
            </h3>
            <IonList
              lines="none"
              data-testid="notifications-items"
            >
              {notificationsNew.map((item, index) => (
                <NotificationItem
                  key={index}
                  item={item}
                  index={index}
                  handleNotificationClick={handleNotificationClick}
                />
              ))}
            </IonList>
          </div>
        )}
        {!!notificationsEarlier.length && (
          <div
            className="notifications-tab-section"
            data-testid="notifications-tab-section-earlier"
          >
            <h3 className="notifications-tab-section-title">
              {i18n.t("notifications.tab.sections.earlier")}
            </h3>
            <IonList
              lines="none"
              data-testid="notifications-items"
            >
              {notificationsEarlier.map((item, index) => (
                <NotificationItem
                  key={index}
                  item={item}
                  index={index}
                  handleNotificationClick={handleNotificationClick}
                />
              ))}
            </IonList>
          </div>
        )}
      </div>
    </TabLayout>
  );
};

export { Notifications };
