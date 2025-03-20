import { startFreeRASP } from "capacitor-freerasp";
import React, { Dispatch, SetStateAction } from "react";
import { i18n } from "../i18n";

export enum ThreatName {
  PRIVILEGED_ACCESS = "Privileged Access",
  DEBUG = "Debug",
  SIMULATOR = "Simulator",
  APP_INTEGRITY = "App Integrity",
  UNOFFICIAL_STORE = "Unofficial Store",
  HOOKS = "Hooks",
  DEVICE_BINDING = "Device Binding",
  SECURE_HARDWARE_NOT_AVAILABLE = "Secure Hardware Not Available",
  SYSTEM_VPN = "System VPN",
  PASSCODE = "Passcode",
  SCREENSHOT = "Screenshot",
  SCREEN_RECORDING = "Screen Recording",
  OBFUSCATION_ISSUES = "Obfuscation Issues",
  DEVELOPER_MODE = "Developer Mode",
  ADB_ENABLED = "ADB Enabled",
  DEVICE_ID = "Device ID",
}

export interface ThreatCheck {
  name: ThreatName;
  isSecure: boolean;
}

export type FreeRASPInitResult =
  | { success: true }
  | { success: false; error: unknown };

export const freeRASPConfig = {
  androidConfig: {
    packageName: "org.cardanofoundation.idw",
    certificateHashes: [process.env.APP_CERT_HASH || ""],
  },
  iosConfig: {
    appBundleId: "org.cardanofoundation.idw",
    appTeamId: process.env.APP_TEAM_ID || "",
  },
  watcherMail: process.env.WATCHER_MAIL || "",
  isProd: process.env.DEV_DISABLE_RASP === "false" ? true : false,
};

export const commonChecks: ThreatCheck[] = [
  { name: ThreatName.PRIVILEGED_ACCESS, isSecure: true },
  { name: ThreatName.DEBUG, isSecure: true },
  { name: ThreatName.SIMULATOR, isSecure: true },
  { name: ThreatName.APP_INTEGRITY, isSecure: true },
  { name: ThreatName.UNOFFICIAL_STORE, isSecure: true },
  { name: ThreatName.HOOKS, isSecure: true },
  { name: ThreatName.DEVICE_BINDING, isSecure: true },
  { name: ThreatName.SECURE_HARDWARE_NOT_AVAILABLE, isSecure: true },
  { name: ThreatName.SYSTEM_VPN, isSecure: true },
  { name: ThreatName.PASSCODE, isSecure: true },
  { name: ThreatName.SCREENSHOT, isSecure: true },
  { name: ThreatName.SCREEN_RECORDING, isSecure: true },
];

export const androidChecks: ThreatCheck[] = [
  { name: ThreatName.OBFUSCATION_ISSUES, isSecure: true },
  { name: ThreatName.DEVELOPER_MODE, isSecure: true },
  { name: ThreatName.ADB_ENABLED, isSecure: true },
];

export const iosChecks: ThreatCheck[] = [
  { name: ThreatName.DEVICE_ID, isSecure: true },
];

const createThreatAction = (
  setAppChecks: React.Dispatch<React.SetStateAction<ThreatCheck[]>>,
  threatName: ThreatName,
  description: string
) => {
  if (process.env.DEV_DISABLE_RASP === "true") return;

  return () => {
    setAppChecks((currentState) => {
      return currentState.map((threat) => {
        if (threat.name === threatName) {
          return { ...threat, description, isSecure: false };
        }
        return threat;
      });
    });
  };
};

// Initialize freeRASP with state setters
export const initializeFreeRASP = async (
  setAppChecks: Dispatch<SetStateAction<ThreatCheck[]>>
): Promise<FreeRASPInitResult> => {
  const actions = {
    privilegedAccess: createThreatAction(
      setAppChecks,
      ThreatName.PRIVILEGED_ACCESS,
      i18n.t("systemthreats.rules.privilegedaccess")
    ),
    debug: createThreatAction(
      setAppChecks,
      ThreatName.DEBUG,
      i18n.t("systemthreats.rules.debug")
    ),
    simulator: createThreatAction(
      setAppChecks,
      ThreatName.SIMULATOR,
      i18n.t("systemthreats.rules.simulator")
    ),
    appIntegrity: createThreatAction(
      setAppChecks,
      ThreatName.APP_INTEGRITY,
      i18n.t("systemthreats.rules.appintegrity")
    ),
    unofficialStore: createThreatAction(
      setAppChecks,
      ThreatName.UNOFFICIAL_STORE,
      i18n.t("systemthreats.rules.unofficialstore")
    ),
    hooks: createThreatAction(
      setAppChecks,
      ThreatName.HOOKS,
      i18n.t("systemthreats.rules.hooks")
    ),
    deviceBinding: createThreatAction(
      setAppChecks,
      ThreatName.DEVICE_BINDING,
      i18n.t("systemthreats.rules.devicebinding")
    ),
    secureHardwareNotAvailable: createThreatAction(
      setAppChecks,
      ThreatName.SECURE_HARDWARE_NOT_AVAILABLE,
      i18n.t("systemthreats.rules.securehardwarenotavailable")
    ),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    systemVPN: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    passcode: () => {},
    // Note: Threat covered by the privacy screen app
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    screenshot: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    screenRecording: () => {},
    obfuscationIssues: createThreatAction(
      setAppChecks,
      ThreatName.OBFUSCATION_ISSUES,
      i18n.t("systemthreats.rules.obfuscationissues")
    ),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    devMode: () => {},
    adbEnabled: createThreatAction(
      setAppChecks,
      ThreatName.ADB_ENABLED,
      i18n.t("systemthreats.rules.adbenabled")
    ),
    deviceID: createThreatAction(
      setAppChecks,
      ThreatName.DEVICE_ID,
      i18n.t("systemthreats.rules.deviceid")
    ),
  };

  try {
    await startFreeRASP(freeRASPConfig, actions);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};
