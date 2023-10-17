import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cf.identity.wallet",
  appName: "ID Wallet",
  webDir: "build",
  bundledWebRuntime: false,
  plugins: {
    CapacitorSQLite: {
      "iosDatabaseLocation": "Library/IDWalletDatabase"
    },
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      splashFullScreen: true
    },
  }
};

export default config;
