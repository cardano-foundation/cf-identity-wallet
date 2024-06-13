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

const Notifications = () => {
  const pageId = "notifications-tab";
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.NOTIFICATIONS }));
  });

  const handleNotificationsSettings = () => {
    // TODO: Implement settings page
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

  const notifications = [
    { logo: "", label: i18n.t("notifications.tab.label") },
  ];

  const handleNotificationClick = (index: number) => {
    // TODO: Implement notification page
  };

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      title={`${i18n.t("notifications.tab.header")}`}
      additionalButtons={<AdditionalButtons />}
    >
      <div className="notifications-tab-chips">
        <span>
          <IonChip>{i18n.t("notifications.tab.chips.all")}</IonChip>
        </span>
        <span>
          <IonChip>{i18n.t("notifications.tab.chips.identifiers")}</IonChip>
        </span>
        <span>
          <IonChip>{i18n.t("notifications.tab.chips.credentials")}</IonChip>
        </span>
        <span>
          <IonChip>{i18n.t("notifications.tab.chips.connections")}</IonChip>
        </span>
        <span>
          <IonChip>{i18n.t("notifications.tab.chips.cardanoconnect")}</IonChip>
        </span>
      </div>
      <div className="notifications-tab-content">
        <div className="notifications-tab-section">
          <h3 className="notifications-tab-section-title">
            {i18n.t("notifications.tab.sections.new")}
          </h3>
          <IonList
            lines="none"
            data-testid="notifications-items"
          >
            {notifications.map((item, index) => {
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
                  <IonLabel>{item.label}</IonLabel>
                  <IonIcon
                    aria-hidden="true"
                    icon={ellipsisHorizontal}
                    slot="end"
                  />
                </IonItem>
              );
            })}
          </IonList>
        </div>
      </div>
    </TabLayout>
  );
};

export { Notifications };
