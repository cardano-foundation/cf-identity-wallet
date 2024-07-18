import { IonCard, IonList, IonToggle } from "@ionic/react";
import {
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
  getBiometricsCacheCache,
  setEnableBiometricsCache,
} from "../../../../../store/reducers/biometricsCache";
import { Agent } from "../../../../../core/agent/agent";
import { VerifyPassword } from "../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../components/VerifyPasscode";
import { getStateCache } from "../../../../../store/reducers/stateCache";
import { useBiometricAuth } from "../../../../hooks/useBiometricsHook";
import { ChangePin } from "./components/ChangePin";
import { SettingsItem } from "./components/SettingsItem";

const Settings = () => {
  const dispatch = useAppDispatch();
  const stateCache = useSelector(getStateCache);
  const biometricsCache = useSelector(getBiometricsCacheCache);
  const [option, setOption] = useState<number | null>(null);
  const { biometricInfo, handleBiometricAuth } = useBiometricAuth();
  const inBiometricSetup = useRef(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [changePinIsOpen, setChangePinIsOpen] = useState(false);
  const [showManagePassword, setShowManagePassword] = useState(false);

  const securityItems: OptionProps[] = [
    {
      index: 1,
      icon: lockClosedOutline,
      label: i18n.t("settings.sections.security.changepin.title"),
    },
    {
      index: 2,
      icon: informationCircleOutline,
      label: i18n.t("settings.sections.security.managepassword.title"),
    },
    {
      index: 3,
      icon: keyOutline,
      label: i18n.t("settings.sections.security.seedphrase"),
    },
  ];

  if (biometricsCache.enabled !== undefined) {
    securityItems.unshift({
      index: 0,
      icon: fingerPrintOutline,
      label: i18n.t("settings.sections.security.biometry"),
      actionIcon: (
        <IonToggle
          aria-label="Biometric Toggle"
          className="biometric-toggle"
          checked={biometricsCache.enabled}
        />
      ),
    });
  }

  const supportItems = [
    {
      index: 4,
      icon: chatboxEllipsesOutline,
      label: i18n.t("settings.sections.support.contact"),
    },
    {
      index: 5,
      icon: hammerOutline,
      label: i18n.t("settings.sections.support.troubleshooting"),
    },
    {
      index: 6,
      icon: libraryOutline,
      label: i18n.t("settings.sections.support.learnmore"),
    },
    {
      index: 7,
      icon: checkboxOutline,
      label: i18n.t("settings.sections.support.terms"),
    },
    {
      index: 8,
      icon: layersOutline,
      label: i18n.t("settings.sections.support.version"),
      note: pJson.version,
    },
  ];

  const handleToggleBiometricAuth = async () => {
    await Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_BIOMETRY,
        content: { enabled: !biometricsCache.enabled },
      })
    );
    dispatch(setEnableBiometricsCache(!biometricsCache.enabled));
  };

  const handleBiometricUpdate = () => {
    inBiometricSetup.current = false;

    if (biometricsCache.enabled) {
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

  const handleChangePin = () => {
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const handleOptionClick = async (item: OptionProps) => {
    setOption(item.index);
    switch (item.index) {
    case 0: {
      handleBiometricUpdate();
      break;
    }
    case 1: {
      handleChangePin();
      break;
    }
    case 2: {
      setShowManagePassword(true);
      break;
    }
    default:
      return;
    }
  };

  const onVerify = () => {
    switch (option) {
    case 0: {
      biometricAuth();
      break;
    }
    case 1: {
      setChangePinIsOpen(true);
      break;
    }
    default:
      return;
    }
    setOption(null);
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
          {securityItems.map((item: OptionProps) => {
            return (
              <SettingsItem
                key={item.index}
                item={item}
                handleOptionClick={handleOptionClick}
              />
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
          {supportItems.map((item) => {
            return (
              <SettingsItem
                key={item.index}
                item={item}
                handleOptionClick={handleOptionClick}
              />
            );
          })}
        </IonList>
      </IonCard>
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={onVerify}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={onVerify}
      />
      <ChangePin
        isOpen={changePinIsOpen}
        setIsOpen={setChangePinIsOpen}
      />
    </>
  );
};

export { Settings };
