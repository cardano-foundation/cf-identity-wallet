// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
//import { config } from "./shared.config";
const { config } = require("./shared.config");

//
// =====
// Specs
// =====
//
// Normally the specs are written like
// specs: ["./e2e/**/*.spec.ts"],
// but for watch mode we want to run all specs in 1 instance so
// the specs are an array in an array
config.specs = [["./e2e/**/*.test.ts"]];
config.filesToWatch = ["./e2e/**/*.test.ts"];

//
// ================
// Services: Chrome
// ================
//
config.services = (config.services ? config.services : []).concat([
  [
    "chromedriver",
    {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
  ],
]);

// ============
// Capabilities
// ============
//
// For all capabilities please check
// http://appium.io/docs/en/writing-running-appium/caps/#general-capabilities
//
config.capabilities = [
  {
    maxInstances: 1,
    browserName: "chrome",
    "goog:chromeOptions": {
      args: ["--window-size=393,851", "--proxy-server=localhost:3003", "--remote-debugging-port=9222"],
      // See https://chromedriver.chromium.org/mobile-emulation
      // For more details
      mobileEmulation: {
        deviceMetrics: { width: 393, height: 851, pixelRatio: 3 },
        userAgent:
            "Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36",
      },
      prefs: {
        "profile.default_content_setting_values.media_stream_camera": 1,
        "profile.default_content_setting_values.media_stream_mic": 1,
        "profile.default_content_setting_values.notifications": 1,
      },
    },

  },
];

exports.config = config;
