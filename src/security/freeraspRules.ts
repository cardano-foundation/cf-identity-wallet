import { i18n } from "../i18n";
import { ThreatName } from "./freerasp";

export interface Threat {
  name: ThreatName;
  critical: boolean;
  description: string;
}

interface FreeraspRules {
  threats: Record<string, Threat>;
}

export const freeraspRules: FreeraspRules = {
  threats: {
    privileged_access: {
      name: ThreatName.PRIVILEGED_ACCESS,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.privilegedaccess"),
    },
    debug: {
      name: ThreatName.DEBUG,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.debug"),
    },
    simulator: {
      name: ThreatName.SIMULATOR,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.simulator"),
    },
    app_integrity: {
      name: ThreatName.APP_INTEGRITY,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.appintegrity"),
    },
    unofficial_store: {
      name: ThreatName.UNOFFICIAL_STORE,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.unofficialstore"),
    },
    hooks: {
      name: ThreatName.HOOKS,
      critical: true,
      description: i18n.t("systemthreats.rules.hooks"),
    },
    device_binding: {
      name: ThreatName.DEVICE_BINDING,
      critical: true,
      description: i18n.t("systemthreats.rules.devicebinding"),
    },
    secure_hardware_not_available: {
      name: ThreatName.SECURE_HARDWARE_NOT_AVAILABLE,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.securehardwarenotavailable"),
    },
    system_vpn: {
      name: ThreatName.SYSTEM_VPN,
      critical: false,
      description: i18n.t("systemthreats.rules.systemvpn"),
    },
    passcode: {
      name: ThreatName.PASSCODE,
      critical: false,
      description: i18n.t("systemthreats.rules.passcode"),
    },
    // NOTE: cover via privacy plugin
    screenshot: {
      name: ThreatName.SCREENSHOT,
      critical: false,
      description: i18n.t("systemthreats.rules.screenshot"),
    },
    screen_recording: {
      name: ThreatName.SCREEN_RECORDING,
      critical: false,
      description: i18n.t("systemthreats.rules.screenrecording"),
    },
    // Android only
    obfuscation_issues: {
      name: ThreatName.OBFUSCATION_ISSUES,
      critical: true,
      description: i18n.t("systemthreats.rules.obfuscationissues"),
    },
    // Android only
    developer_mode: {
      name: ThreatName.DEVELOPER_MODE,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.developermode"),
    },
    // Android only
    adb_enabled: {
      name: ThreatName.ADB_ENABLED,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.adbenabled"),
    },
    // iOS only
    device_id: {
      name: ThreatName.DEVICE_ID,
      critical: true,
      description: i18n.t("systemthreats.rules.deviceid"),
    },
  },
};
