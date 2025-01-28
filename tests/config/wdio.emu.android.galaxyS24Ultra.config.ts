import {config as sharedConfig} from "./wdio.appium.config.js";

export const config = {
  ...sharedConfig,
  ...{

    capabilities: sharedConfig.capabilities.map((capability) => ({
      platformName: "Android",
      "appium:deviceName": "Galaxy S24 Ultra",
      "appium:platformVersion": "14",
      "appium:automationName": "UiAutomator2",
      ...capability,
    })),
  },
};
