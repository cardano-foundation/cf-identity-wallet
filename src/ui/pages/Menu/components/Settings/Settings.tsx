import {
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonToggle,
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
  fingerPrintOutline,
} from "ionicons/icons";
import "./Settings.scss";
import { i18n } from "../../../../../i18n";
import pJson from "../../../../../../package.json";
import { OptionProps } from "./Settings.types";
import { useBiometricAuth } from "../../../../hooks/useBiometricsHook";
import { MiscRecordId } from "../../../../../core/agent/agent.types";
import { createOrUpdateBasicRecord } from "../../../../../core/agent/records/createOrUpdateBasicRecord";
import { BasicRecord } from "../../../../../core/agent/records";
import { useAppDispatch } from "../../../../../store/hooks";
import { setEnableBiometryCache } from "../../../../../store/reducers/biometryCache";

const Settings = () => {
  const { biometricsIsEnabled, setBiometricsIsEnabled } = useBiometricAuth();
  const dispatch = useAppDispatch();
  const securityItems: OptionProps[] = [
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

  if (biometricsIsEnabled !== undefined) {
    securityItems.unshift({
      icon: fingerPrintOutline,
      label: i18n.t("settings.sections.security.biometry"),
      actionIcon: <IonToggle checked={biometricsIsEnabled} />,
    });
  }

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

  const handleOptionClick = async (item: OptionProps) => {
    switch (item.label) {
    case i18n.t("settings.sections.security.biometry"): {
      setBiometricsIsEnabled(!biometricsIsEnabled);
      await createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.APP_BIOMETRY,
          content: { enabled: !biometricsIsEnabled },
        })
      );
      dispatch(setEnableBiometryCache(!biometricsIsEnabled));
      break;
    }
    default:
      return;
    }
  };

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
          {securityItems.map((item: OptionProps, index) => {
            return (
              <IonItem
                key={index}
                onClick={() => handleOptionClick(item)}
                className="security-item"
                data-testid={`security-item-${index}`}
              >
                <IonIcon
                  aria-hidden="true"
                  icon={item.icon}
                  slot="start"
                />
                <IonLabel>{item.label}</IonLabel>
                {item.actionIcon ? (
                  item.actionIcon
                ) : (
                  <IonIcon
                    aria-hidden="true"
                    icon={chevronForward}
                    slot="end"
                  />
                )}
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
            return (
              <IonItem
                key={index}
                onClick={() => handleOptionClick(item)}
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
