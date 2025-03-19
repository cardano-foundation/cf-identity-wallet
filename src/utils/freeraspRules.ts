import { i18n } from "../i18n";
import { ThreatName } from "./freerasp";

export interface Threat {
  name: ThreatName;
  critical: boolean;
  description: string;
}
interface Threats {
  [key: string]: Threat;
}

interface FreeraspRules {
  threats: Threats;
}

export const freeraspRules: FreeraspRules = {
  threats: {
    privileged_access: {
      name: ThreatName.PRIVILEGED_ACCESS,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.privileged_access"),
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
      description: i18n.t("systemthreats.rules.app_integrity"),
    },
    unofficial_store: {
      name: ThreatName.UNOFFICIAL_STORE,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.unofficial_store"),
    },
    hooks: {
      name: ThreatName.HOOKS,
      critical: true,
      description: i18n.t("systemthreats.rules.hooks"),
    },
    device_binding: {
      name: ThreatName.DEVICE_BINDING,
      critical: true,
      description: i18n.t("systemthreats.rules.device_binding"),
    },
    secure_hardware_not_available: {
      name: ThreatName.SECURE_HARDWARE_NOT_AVAILABLE,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.secure_hardware_not_available"),
    },
    system_vpn: {
      name: ThreatName.SYSTEM_VPN,
      critical: false,
      description: i18n.t("systemthreats.rules.system_vpn"),
    },
    passcode: {
      name: ThreatName.PASSCODE,
      critical: false,
      description: i18n.t("systemthreats.rules.passcode"),
    },
    screenshot: {
      name: ThreatName.SCREENSHOT,
      critical: false,
      description: i18n.t("systemthreats.rules.screenshot"),
    },
    screen_recording: {
      name: ThreatName.SCREEN_RECORDING,
      critical: false,
      description: i18n.t("systemthreats.rules.screen_recording"),
    },
    // Android only
    obfuscation_issues: {
      name: ThreatName.OBFUSCATION_ISSUES,
      critical: true,
      description: i18n.t("systemthreats.rules.obfuscation_issues"),
    },
    // Android only
    developer_mode: {
      name: ThreatName.DEVELOPER_MODE,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.developer_mode"),
    },
    // Android only
    adb_enabled: {
      name: ThreatName.ADB_ENABLED,
      critical: process.env.DEV_DISABLE_RASP === "true" ? false : true,
      description: i18n.t("systemthreats.rules.adb_enabled"),
    },
    // iOS only
    device_id: {
      name: ThreatName.DEVICE_ID,
      critical: false,
      description: i18n.t("systemthreats.rules.device_id"),
    },
  },
};
