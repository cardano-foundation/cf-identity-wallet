# ID Wallet
An open-source Decentralised Identity (DID) and Verifiable Credential (VC) Wallet complying to W3C and DIDComm standards utilising Local-First Software design and development principles.  The wallet also features a bespoke Cardano Crypto Wallet. 

## Deployment steps before building
Our DIDComm over LibP2P implementation currently depends on a locally deployed WebRTC relay.
```
docker compose up -d
```

## Building the app
TODO

## End to end testing
### Pre-installed on local:

- [allure commandline](https://docs.qameta.io/allure-report/#_installing_a_commandline)
- npm and node js
- android emulator for samsung galaxy s23 ultra is configured or ios simulator for iphone 15 pro / 15 pro max
- add .env to root folder with APP_PATH property with path to app build for chosen platform e.g.
- appium installed locally(in case if @wdio/appium-service will not work as expected)
```
# Android
# APP_PATH=<LOCAL_PATH/app-release-unsigned.apk>

# iOS
APP_PATH=<LOCAL_PATH/App.app>
```
### Test run in local:

1. Install all packages locally

```
npm install
```

2. Run tests for chosen platform and phone e.g.

```
npm run wdio:ios:15promax
```
or
```
npm run wdio:android:s23ultra
```
- IF there are issues with appium service run by WDIO, please start appium in terminal separately
- in case WDIO tests will not exit on its own kill the process yourself e.g. ``` pkill -9 -f wdio  ```

3. Set ALLURE_RESULTS_DIR on your local
```angular2html
ALLURE_RESULTS_DIR=tests/.reports/allure-results
```
4. Generate allure report
```
allure generate tests/.reports/allure-results -o tests/.reports/allure-report --clean
```

4. Open allure report
```
allure open tests/.reports/allure-report
```

### Generate icons

Install capacitor [assets tool](https://capacitorjs.com/docs/guides/splash-screens-and-icons):
```
npm install @capacitor/assets --save-dev
```

Create a `assets` folder in the root directory with:
```
assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── splash.png
└── splash-dark.png
```

For iOS: 
```
npx @capacitor/assets generate --ios
```
For Android: 
```
npx @capacitor/assets generate --android
```
