// utils/freerasp.ts
import { startFreeRASP } from "capacitor-freerasp";
import React, { Dispatch, SetStateAction } from "react";

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

interface FreeRASPResult {
  success: boolean;
  error?: unknown;
}

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
  threatName: ThreatName
) => {
  return () => {
    setAppChecks((currentState) => {
      return currentState.map((threat) => {
        if (threat.name === threatName) {
          return { ...threat, isSecure: false };
        }
        return threat;
      });
    });
  };
};

// Initialize freeRASP with state setters
export const initializeFreeRASP = async (
  setAppChecks: Dispatch<SetStateAction<ThreatCheck[]>>
): Promise<FreeRASPResult> => {
  const actions = {
    privilegedAccess: createThreatAction(
      setAppChecks,
      ThreatName.PRIVILEGED_ACCESS
    ),
    debug: createThreatAction(setAppChecks, ThreatName.DEBUG),
    simulator: createThreatAction(setAppChecks, ThreatName.SIMULATOR),
    appIntegrity: createThreatAction(setAppChecks, ThreatName.APP_INTEGRITY),
    unofficialStore: createThreatAction(
      setAppChecks,
      ThreatName.UNOFFICIAL_STORE
    ),
    hooks: createThreatAction(setAppChecks, ThreatName.HOOKS),
    deviceBinding: createThreatAction(setAppChecks, ThreatName.DEVICE_BINDING),
    secureHardwareNotAvailable: createThreatAction(
      setAppChecks,
      ThreatName.SECURE_HARDWARE_NOT_AVAILABLE
    ),
    systemVPN: createThreatAction(setAppChecks, ThreatName.SYSTEM_VPN),
    passcode: createThreatAction(setAppChecks, ThreatName.PASSCODE),
    deviceID: createThreatAction(setAppChecks, ThreatName.DEVICE_ID),
    obfuscationIssues: createThreatAction(
      setAppChecks,
      ThreatName.OBFUSCATION_ISSUES
    ),
    devMode: createThreatAction(setAppChecks, ThreatName.DEVELOPER_MODE),
    adbEnabled: createThreatAction(setAppChecks, ThreatName.ADB_ENABLED),
    screenshot: createThreatAction(setAppChecks, ThreatName.SCREENSHOT),
    screenRecording: createThreatAction(
      setAppChecks,
      ThreatName.SCREEN_RECORDING
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
