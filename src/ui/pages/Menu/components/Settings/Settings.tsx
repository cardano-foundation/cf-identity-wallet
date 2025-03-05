import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { Browser } from "@capacitor/browser";
import { IonCard, IonList, IonToggle } from "@ionic/react";
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from "capacitor-native-settings";
import {
  checkboxOutline,
  fingerPrintOutline,
  informationCircleOutline,
  keyOutline,
  layersOutline,
  libraryOutline,
  lockClosedOutline,
  logoDiscord,
} from "ionicons/icons";
import { useState } from "react";
import { useSelector } from "react-redux";
import pJson from "../../../../../../package.json";
import { Agent } from "../../../../../core/agent/agent";
import { MiscRecordId } from "../../../../../core/agent/agent.types";
import { BasicRecord } from "../../../../../core/agent/records";
import { i18n } from "../../../../../i18n";
import { useAppDispatch } from "../../../../../store/hooks";
import {
  getBiometricsCacheCache,
  setEnableBiometricsCache,
} from "../../../../../store/reducers/biometricsCache";
import { Alert } from "../../../../components/Alert";
import { Verification } from "../../../../components/Verification";
import {
  DISCORD_LINK,
  DOCUMENTATION_LINK,
} from "../../../../globals/constants";
import { usePrivacyScreen } from "../../../../hooks/privacyScreenHook";
import { useBiometricAuth } from "../../../../hooks/useBiometricsHook";
import { showError } from "../../../../utils/error";
import { SubMenuKey } from "../../Menu.types";
import { ChangePin } from "./components/ChangePin";
import { SettingsItem } from "./components/SettingsItem";
import "./Settings.scss";
import { OptionIndex, OptionProps, SettingsProps } from "./Settings.types";

const Settings = ({ switchView }: SettingsProps) => {
  const dispatch = useAppDispatch();
  const biometricsCache = useSelector(getBiometricsCacheCache);
  const [option, setOption] = useState<number | null>(null);
  const { biometricInfo, handleBiometricAuth } = useBiometricAuth();
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [changePinIsOpen, setChangePinIsOpen] = useState(false);
  const { disablePrivacy, enablePrivacy } = usePrivacyScreen();
  const [openBiometricAlert, setOpenBiometricAlert] = useState(false);

  const securityItems: OptionProps[] = [
    {
      index: OptionIndex.ChangePin,
      icon: lockClosedOutline,
      label: i18n.t("tabs.menu.tab.settings.sections.security.changepin.title"),
    },
    {
      index: OptionIndex.ManagePassword,
      icon: informationCircleOutline,
      label: i18n.t(
        "tabs.menu.tab.settings.sections.security.managepassword.title"
      ),
    },
    {
      index: OptionIndex.RecoverySeedPhrase,
      icon: keyOutline,
      label: i18n.t(
        "tabs.menu.tab.settings.sections.security.seedphrase.title"
      ),
    },
  ];

  if (biometricsCache.enabled !== undefined) {
    securityItems.unshift({
      index: OptionIndex.BiometricUpdate,
      icon: fingerPrintOutline,
      label: i18n.t("tabs.menu.tab.settings.sections.security.biometry"),
      actionIcon: (
        <IonToggle
          aria-label="Biometric Toggle"
          className="toggle-button"
          checked={biometricsCache.enabled}
        />
      ),
    });
  }

  const supportItems = [
    {
      index: OptionIndex.Documentation,
      icon: libraryOutline,
      label: i18n.t("tabs.menu.tab.settings.sections.support.learnmore"),
    },
    {
      index: OptionIndex.Term,
      icon: checkboxOutline,
      label: i18n.t("tabs.menu.tab.settings.sections.support.terms.title"),
    },
    {
      index: OptionIndex.Contact,
      icon: logoDiscord,
      label: i18n.t("tabs.menu.tab.settings.sections.support.contact"),
    },
    {
      index: OptionIndex.Version,
      icon: layersOutline,
      label: i18n.t("tabs.menu.tab.settings.sections.support.version"),
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
    if (biometricsCache.enabled) {
      handleToggleBiometricAuth();
      return;
    }

    if (
      !biometricInfo?.strongBiometryIsAvailable &&
      biometricInfo?.code === BiometryErrorType.biometryNotEnrolled
    ) {
      setOpenBiometricAlert(true);
      return;
    }

    setVerifyIsOpen(true);
  };

  const biometricAuth = async () => {
    try {
      await disablePrivacy();
      const result = await handleBiometricAuth();
      await enablePrivacy();
      if (result === true) handleToggleBiometricAuth();
    } catch (e) {
      showError("Unable to enable/disable biometric auth", e, dispatch);
    }
  };

  const openSetting = () => {
    NativeSettings.open({
      optionAndroid: AndroidSettings.Security,
      optionIOS: IOSSettings.TouchIdPasscode,
    });
  };

  const handleChangePin = () => {
    setVerifyIsOpen(true);
  };

  const handleOptionClick = async (item: OptionProps) => {
    setOption(item.index);
    switch (item.index) {
    case OptionIndex.BiometricUpdate: {
      handleBiometricUpdate();
      break;
    }
    case OptionIndex.ChangePin: {
      handleChangePin();
      break;
    }
    case OptionIndex.ManagePassword: {
      switchView && switchView(SubMenuKey.ManagePassword);
      break;
    }
    case OptionIndex.Contact: {
      Browser.open({ url: DISCORD_LINK });
      break;
    }
    case OptionIndex.Documentation: {
      Browser.open({ url: DOCUMENTATION_LINK });
      break;
    }
    case OptionIndex.Term: {
      switchView && switchView(SubMenuKey.TermsAndPrivacy);
      break;
    }
    case OptionIndex.RecoverySeedPhrase: {
      switchView && switchView(SubMenuKey.RecoverySeedPhrase);
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

  const closeAlert = () => {
    setOpenBiometricAlert(false);
  };

  return (
    <>
      <div className="settings-section-title">
        {i18n.t("tabs.menu.tab.settings.sections.security.title")}
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
        {i18n.t("tabs.menu.tab.settings.sections.support.title")}
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
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={onVerify}
      />
      <ChangePin
        isOpen={changePinIsOpen}
        setIsOpen={setChangePinIsOpen}
      />
      <Alert
        isOpen={openBiometricAlert}
        setIsOpen={setOpenBiometricAlert}
        dataTestId="biometric-enable-alert"
        headerText={i18n.t(
          "tabs.menu.tab.settings.sections.security.biometricsalert.message"
        )}
        confirmButtonText={`${i18n.t(
          "tabs.menu.tab.settings.sections.security.biometricsalert.ok"
        )}`}
        cancelButtonText={`${i18n.t(
          "tabs.menu.tab.settings.sections.security.biometricsalert.cancel"
        )}`}
        actionConfirm={openSetting}
        actionCancel={closeAlert}
        actionDismiss={closeAlert}
      />
    </>
  );
};

export { Settings };
