import {config as sharedConfig} from "./wdio.config.js";

export const config = {
  ...sharedConfig,
  ...{
    host: "0.0.0.0",
    port: 4723,
    services: [
      [
        "appium",
        {
          // For options see
          // https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-appium-service
          args: {
            // For arguments see
            // https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-appium-service
            // This is needed to tell Appium that we can execute local ADB commands
            // and to automatically download the latest version of ChromeDriver
            relaxedSecurity: true,
            allowInsecure: ["chromedriver_autodownload"],
            log: "./.appium/appium.log",
            logLevel: "info",
          },
          command: "appium",
        },
      ],
    ],
  },
};
