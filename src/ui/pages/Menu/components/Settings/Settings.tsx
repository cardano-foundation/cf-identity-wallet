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
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from "capacitor-native-settings";
import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { i18n } from "../../../../../i18n";
import pJson from "../../../../../../package.json";
import { OptionProps } from "./Settings.types";
import { MiscRecordId } from "../../../../../core/agent/agent.types";
import { BasicRecord } from "../../../../../core/agent/records";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  getBiometryCacheCache,
  setEnableBiometryCache,
} from "../../../../../store/reducers/biometryCache";
import { Agent } from "../../../../../core/agent/agent";
import { VerifyPassword } from "../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../components/VerifyPasscode";
import { getStateCache } from "../../../../../store/reducers/stateCache";
import { useBiometricAuth } from "../../../../hooks/useBiometricsHook";

const Settings = () => {
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  const stateCache = useSelector(getStateCache);
  const biometryCache = useSelector(getBiometryCacheCache);
  const dispatch = useAppDispatch();
  const { biometricInfo, handleBiometricAuth } = useBiometricAuth();
  const inBiometricSetup = useRef(false);

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

  if (biometryCache.enabled !== undefined) {
    securityItems.unshift({
      icon: fingerPrintOutline,
      label: i18n.t("settings.sections.security.biometry"),
      actionIcon: <IonToggle checked={biometryCache.enabled} />,
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

  const handleToggleBiometricAuth = async () => {
    await Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_BIOMETRY,
        content: { enabled: !biometryCache.enabled },
      })
    );
    dispatch(setEnableBiometryCache(!biometryCache.enabled));
  };

  const handleBiometricUpdate = () => {
    inBiometricSetup.current = false;

    if (biometryCache.enabled) {
      handleToggleBiometricAuth();
      return;
    }

    if (
      !biometricInfo?.strongBiometryIsAvailable &&
      biometricInfo?.code === BiometryErrorType.biometryNotEnrolled
    ) {
      NativeSettings.open({
        optionAndroid: AndroidSettings.Security,
        optionIOS: IOSSettings.TouchIdPasscode,
      }).then((result) => {
        inBiometricSetup.current = result.status;
      });

      return;
    }

    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const biometricAuth = async () => {
    const result = await handleBiometricAuth();
    if (result) handleToggleBiometricAuth();
  };

  useEffect(() => {
    if (biometricInfo?.strongBiometryIsAvailable && inBiometricSetup.current) {
      handleBiometricUpdate();
    }
  }, [biometricInfo]);

  const handleOptionClick = async (item: OptionProps) => {
    switch (item.label) {
    case i18n.t("settings.sections.security.biometry"): {
      handleBiometricUpdate();
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
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={biometricAuth}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={biometricAuth}
      />
    </>
  );
};

export { Settings };
