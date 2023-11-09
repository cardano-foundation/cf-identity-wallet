import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cf.identity.wallet",
  appName: "ID Wallet",
  webDir: "build",
  bundledWebRuntime: false,
  android: {
    webContentsDebuggingEnabled: true,
  },
  ios: {
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    CapacitorSQLite: {
      "iosDatabaseLocation": "Library/IDWalletDatabase"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 1000,
      backgroundColor: "#92FFC0"
    },
  }
};

export default config;
