import { IonButton, IonList } from "@ionic/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { KeriaNotification } from "../../../../core/agent/agent.types";
import { i18n } from "../../../../i18n";
import { NotificationItem } from "../NotificationItem";
import {
  EarlierNotificationProps,
  EarlierNotificationRef,
} from "./EarlierNotification.types";

const SHOWN_EARLIER_NOTIFICATION = 3;
const LOAD_EARLIER_NOTIFICATION = 5;

const EarlierNotification = forwardRef<
  EarlierNotificationRef,
  EarlierNotificationProps
>(({ data, onNotificationClick }, ref) => {
  const [displayLength, setDisplayLength] = useState(
    SHOWN_EARLIER_NOTIFICATION
  );

  const displayNotificationsEarlier = useMemo(() => {
    if (displayLength >= data.length) return data;

    return data.slice(0, displayLength);
  }, [displayLength, data]);

  const shouldDisplayExpandNotificationsEarlierButton =
    data.length > displayLength && displayLength === SHOWN_EARLIER_NOTIFICATION;

  useImperativeHandle(ref, () => ({
    reset: () => {
      setDisplayLength(SHOWN_EARLIER_NOTIFICATION);
    },
  }));

  const loadMore = useCallback(() => {
    setDisplayLength((value) => value + LOAD_EARLIER_NOTIFICATION);
  }, []);

  if (!displayNotificationsEarlier.length) return null;

  return (
    <div
      className="notifications-tab-section"
      data-testid="notifications-tab-section-earlier"
    >
      <h3 className="notifications-tab-section-title">
        {i18n.t("notifications.tab.sections.earlier.title")}
      </h3>
      <InfiniteScroll
        dataLength={displayNotificationsEarlier.length}
        next={loadMore}
        loader={<div></div>}
        hasMore={
          data.length >= displayLength &&
          !shouldDisplayExpandNotificationsEarlierButton
        }
        scrollableTarget="notifications-tab"
      >
        <IonList
          lines="none"
          data-testid="notifications-items"
          id="notification-target"
        >
          {displayNotificationsEarlier.map((item: KeriaNotification, index) => (
            <NotificationItem
              key={index}
              item={item}
              index={index}
              handleNotificationClick={() => onNotificationClick(item)}
            />
          ))}
        </IonList>
      </InfiniteScroll>
      {shouldDisplayExpandNotificationsEarlierButton && (
        <IonButton
          onClick={loadMore}
          fill="outline"
          className="show-ealier-btn secondary-button"
          data-testid="show-earlier-btn"
        >
          {i18n.t("notifications.tab.sections.earlier.buttons.showealier")}
        </IonButton>
      )}
      {data.length === displayNotificationsEarlier.length && (
        <p className="end-message">
          {i18n.t("notifications.tab.sections.earlier.end")}
        </p>
      )}
    </div>
  );
});

export { EarlierNotification };
