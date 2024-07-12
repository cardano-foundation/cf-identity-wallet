import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  getNotificationsCache,
  setReadedNotification,
} from "../../../store/reducers/notificationsCache";
import { NotificationItem } from "./NotificationItem";
import {
  KeriaNotification,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { FilterChipProps, NotificationFilter } from "./Notification.types";
import { EarlierNotification } from "./components";
import { EarlierNotificationRef } from "./components/EarlierNotification.types";
import { NotificationOptionsModal } from "./components/NotificationOptionsModal";
import { Agent } from "../../../core/agent/agent";

const Chip = ({ filter, label, isActive, onClick }: FilterChipProps) => (
  <span>
    <IonChip
      className={isActive ? "selected" : ""}
      onClick={() => onClick(filter)}
      data-testid={`${filter}-filter-btn`}
    >
      {label}
    </IonChip>
  </span>
);

const Notifications = () => {
  const pageId = "notifications-tab";
  const dispatch = useAppDispatch();
  const history = useHistory();
  const stateCache = useAppSelector(getStateCache);
  const notifications = useAppSelector(getNotificationsCache);
  const [selectedFilter, setSelectedFilter] = useState(NotificationFilter.All);
  const earlierNotificationRef = useRef<EarlierNotificationRef>(null);
  const [selectedItem, setSelectedItem] = useState<KeriaNotification | null>(
    null
  );

  const filteredNotification = useMemo(() => {
    if (selectedFilter === NotificationFilter.All) {
      return notifications;
    }

    if (selectedFilter === NotificationFilter.Identifier) {
      return notifications.filter(
        (notification) => notification.a.r === NotificationRoute.MultiSigIcp
      );
    }

    return notifications.filter((notification) =>
      [NotificationRoute.ExnIpexGrant, NotificationRoute.ExnIpexApply].includes(
        notification.a.r as NotificationRoute
      )
    );
  }, [notifications, selectedFilter]);

  const notificationsNew = filteredNotification.filter(
    (notification) =>
      timeDifference(notification.createdAt)[1] === "m" ||
      timeDifference(notification.createdAt)[1] === "h"
  );

  const notificationsEarlier = useMemo(
    () =>
      filteredNotification.filter(
        (notification) =>
          timeDifference(notification.createdAt)[1] !== "h" &&
          timeDifference(notification.createdAt)[1] !== "m"
      ),
    [filteredNotification]
  );

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.NOTIFICATIONS }));
  });

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="notifications-settings-button"
        data-testid="notifications-settings-button"
      >
        <IonIcon
          slot="icon-only"
          icon={settingsOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  const maskAsReaded = async (notification: KeriaNotification) => {
    if (notification.read) return;

    try {
      await Agent.agent.signifyNotifications.readNotification(notification.id);

      dispatch(
        setReadedNotification({
          id: notification.id,
          read: !notification.read,
        })
      );
    } catch (e) {
      // TODO: Handle error
    }
  };

  const handleNotificationClick = async (item: KeriaNotification) => {
    await maskAsReaded(item);

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
    {
      filter: NotificationFilter.All,
      label: i18n.t("notifications.tab.chips.all"),
    },
    {
      filter: NotificationFilter.Identifier,
      label: i18n.t("notifications.tab.chips.identifiers"),
    },
    {
      filter: NotificationFilter.Credential,
      label: i18n.t("notifications.tab.chips.credentials"),
    },
  ];

  const handleSelectFilter = (filter: NotificationFilter) => {
    setSelectedFilter(filter);
    earlierNotificationRef.current?.reset();
  };

  const onOpenOptionModal = (item: KeriaNotification | null) => {
    setSelectedItem(item);
  };

  useEffect(() => {
    if (history.location.pathname !== TabsRoutePath.NOTIFICATIONS)
      earlierNotificationRef.current?.reset();
  }, [history.location.pathname]);

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
            isActive={option.filter === selectedFilter}
            onClick={handleSelectFilter}
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
              {notificationsNew.map((item: KeriaNotification) => (
                <NotificationItem
                  key={item.id}
                  item={item}
                  onClick={handleNotificationClick}
                  onOptionButtonClick={onOpenOptionModal}
                />
              ))}
            </IonList>
          </div>
        )}
        <EarlierNotification
          pageId={pageId}
          ref={earlierNotificationRef}
          data={notificationsEarlier}
          onNotificationClick={handleNotificationClick}
          onOpenOptionModal={onOpenOptionModal}
        />
      </div>
      {selectedItem && (
        <NotificationOptionsModal
          notification={selectedItem}
          onShowDetail={handleNotificationClick}
          optionsIsOpen={!!selectedItem}
          setCloseModal={() => onOpenOptionModal(null)}
        />
      )}
    </TabLayout>
  );
};

export { Notifications };
