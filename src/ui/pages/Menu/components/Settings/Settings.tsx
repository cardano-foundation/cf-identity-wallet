import {
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
} from "@ionic/react";
import {
  chevronForward,
  lockClosedOutline,
  informationCircleOutline,
  keyOutline,
  chatboxEllipsesOutline,
  hammerOutline,
  libraryOutline,
  checkboxOutline,
  layersOutline,
} from "ionicons/icons";
import "./Settings.scss";
import { i18n } from "../../../../../i18n";
import pJson from "../../../../../../package.json";

const Settings = () => {
  const securityItems = [
    {
      icon: lockClosedOutline,
      label: i18n.t("settings.sections.security.changepin"),
    },
    {
      icon: informationCircleOutline,
      label: i18n.t("settings.sections.security.manageoperationspassword"),
    },
    {
      icon: keyOutline,
      label: i18n.t("settings.sections.security.seedphrase"),
    },
  ];

  const supportItems = [
    {
      icon: chatboxEllipsesOutline,
      label: i18n.t("settings.sections.support.contact"),
    },
    {
      icon: hammerOutline,
      label: i18n.t("settings.sections.support.troubleshooting"),
    },
    {
      icon: libraryOutline,
      label: i18n.t("settings.sections.support.learnmore"),
    },
    {
      icon: checkboxOutline,
      label: i18n.t("settings.sections.support.terms"),
    },
  ];

  return (
    <>
      <div className="settings-section-title">
        {i18n.t("settings.sections.security.title")}
      </div>
      <IonCard>
        <IonList
          lines="none"
          data-testid="settings-security-items"
        >
          {securityItems.map((item, index) => {
            const handleItemClick = () => {
              // @TODO - sdisalvo: Add custom onClick logic here for each item
              // console.log(`Clicked item ${index}`);
            };
            return (
              <IonItem
                key={index}
                onClick={handleItemClick}
                className="security-item"
                data-testid={`security-item-${index}`}
              >
                <IonIcon
                  aria-hidden="true"
                  icon={item.icon}
                  slot="start"
                />
                <IonLabel>{item.label}</IonLabel>
                <IonIcon
                  aria-hidden="true"
                  icon={chevronForward}
                  slot="end"
                />
              </IonItem>
            );
          })}
        </IonList>
      </IonCard>
      <div className="settings-section-title">
        {i18n.t("settings.sections.support.title")}
      </div>
      <IonCard>
        <IonList
          lines="none"
          data-testid="settings-support-items"
        >
          {supportItems.map((item, index) => {
            const handleItemClick = () => {
              // @TODO - sdisalvo: Add custom onClick logic here for each item
              // console.log(`Clicked item ${index}`);
            };
            return (
              <IonItem
                key={index}
                onClick={handleItemClick}
                className="support-item"
                data-testid={`support-item-${index}`}
              >
                <IonIcon
                  aria-hidden="true"
                  icon={item.icon}
                  slot="start"
                />
                <IonLabel>{item.label}</IonLabel>
                <IonIcon
                  aria-hidden="true"
                  icon={chevronForward}
                  slot="end"
                />
              </IonItem>
            );
          })}
          <IonItem className="support-item">
            <IonIcon
              aria-hidden="true"
              icon={layersOutline}
              slot="start"
            />
            <IonLabel>{i18n.t("settings.sections.support.version")}</IonLabel>
            <IonNote slot="end">{pJson.version}</IonNote>
          </IonItem>
        </IonList>
      </IonCard>
    </>
  );
};

export { Settings };
