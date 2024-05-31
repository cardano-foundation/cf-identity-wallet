# Testing Guide

## Unit tests

This project uses [Jest Testing Framework](https://jestjs.io/) for unit testing.

### Run tests:

1. Install all packages locally
```
npm install
```
2. Run the test
```
npm run test
```

## End-to-End (E2E) Testing
### Pre-installed on local:

- [allure commandline](https://docs.qameta.io/allure-report/#_installing_a_commandline)
- Node.js and npm
- Appium installed locally (in case if @wdio/appium-service will not work as expected)
  - install appium e.g. ``` brew install appium ```
  - install driver for ios ``` appium driver install xcuitest ```
  - install driver for android ``` appium driver install uiautomator2 ```
  - install driver for chrome ``` appium driver install chromium ```
  - install driver for safari ``` appium driver install safari ```
- Android Emulator for [Samsung Galaxy S23 Ultra](https://developer.samsung.com/galaxy-emulator-skin/guide.html) is configured or iOS Simulator for [iPhone 15 Pro / 15 Pro Max](https://developer.apple.com/documentation/xcode/installing-additional-simulator-runtimes)
- Create .env file in your local root project folder with APP_PATH, KERIA_IP property with path to app build for chosen platform
```
# Android
APP_PATH=<LOCAL_PATH/app-release-unsigned.apk>
KERIA_IP=<IP_V4>

# iOS
APP_PATH=<LOCAL_PATH/App.app>
KERIA_IP=<IP_V4>
```

#### How to get IP v4 address:
This is required to connect the simulator to the locally running KERIA docker container on your machine.
#### MacOS:
````bash
ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | head -1 | awk '{ print $2 }'
````
#### Windows:
````bash
ipconfig | findstr /R /C:"IPv4 Address"
````
#### Linux:
````bash
ip addr show  | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | head -1 | awk '{ print $2 }'
````

### Test run in Local:

1. Install all packages locally
```
npm install
```
2. Run for chosen platform and phone e.g.:
- for all tests
```
npm run wdio:android:s23ultra
```
or
```
npm run wdio:ios:15promax
```
- for specific feature
```
npm run wdio:ios:15promax -- --spec ./tests/features/passcode.feature
```
- for specific scenario in feature you want to run it put a line number at which there is scenario title
```
npm run wdio:ios:15promax -- --spec ./tests/features/passcode.feature:18
```
- If there are issues with appium service run by WDIO, please start appium in terminal separately
- In case WDIO tests will not exit on its own kill the process yourself e.g. ``` pkill -9 -f wdio ```

3. Generate allure report
```
allure generate tests/.reports/allure-results -o tests/.reports/allure-report --clean
```
4. Open allure report
```
allure open tests/.reports/allure-report
```
