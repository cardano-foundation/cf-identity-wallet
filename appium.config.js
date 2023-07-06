
import path from "path";

module.exports = {
  port: 4723,
  capabilities: [
    {
      platformName: 'Android',
      platformVersion: '8.1',
      deviceName: 'Android Emulator',
      app: path.resolve(__dirname, 'android', 'app', 'release', 'release', 'app-release.apk'),
      automationName: 'UiAutomator2',
      appWaitActivity: '*'
    }
  ]
};
