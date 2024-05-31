import process from "process";
import {config as sharedConfig} from "./wdio.appium.config.js";

export const config = {
  ...sharedConfig,
  ...{
    capabilities: [
      {
        // The defaults you need to have in your config
        platformName: "Android",
        maxInstances: 1,
        // For W3C the appium capabilities need to have an extension prefix
        // This is `appium:` for all Appium Capabilities which can be found here
        // http://appium.io/docs/en/writing-running-appium/caps/
        "appium:deviceName": "Galaxy S24 Ultra",
        "appium:platformVersion": "14",
        "appium:orientation": "PORTRAIT",
        "appium:automationName": "UiAutomator2",
        "appium:autoWebview": true,
        "appium:noReset": false,
        // The path to the app
        "appium:app": process.env.APP_PATH,
        "appium:newCommandTimeout": 240,
      },
    ],
  }
};
