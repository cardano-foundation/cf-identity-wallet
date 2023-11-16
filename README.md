# ID Wallet
An open-source Decentralised Identity (DID) and Verifiable Credential (VC) Wallet complying to W3C and DIDComm standards utilising Local-First Software design and development principles.  The wallet also features a bespoke Cardano Crypto Wallet. 

## Getting Started

### Requirements
- Node.js: Version 18.16.0 or higher.
- npm: Compatible with the Node.js version.
- Xcode: For iOS emulation (latest version recommended).
- Android Studio: For Android emulation (latest version recommended).
- Capacitor: Version 4.8.1 (refer to package.json).  For detailed environment setup, refer to the [Capacitor Environment Setup Guide](https://capacitorjs.com/docs/getting-started/environment-setup).
- Mobile Device: iOS or Android for running the app on physical devices.

Ensure that your system meets these requirements to successfully use and develop the Identity Wallet application.

### Preparing the App
Before running the app, ensure that all dependencies are installed and the app is built properly. In the project root directory, run the following commands:
1. Install Dependencies:
```bash
npm install
```
2. Build the app:
```bash
npm run build
```
3. Prepare Capacitor:

This command will sync all changes to iOS and Android.
```bash
npm run build:cap
```

###  Running in the browser
```bash
npm run dev
```

###  Running in an Emulator
#### Running on Xcode Emulator
- Install Xcode: Ensure you have the latest version of Xcode installed on your Mac.
- Open the iOS Simulator: Open Xcode, navigate to `Xcode > Open Developer Tool > Simulator`.
- Select the desired iOS Device: Choose an iOS device model from the simulator list.
- Run the Application: In your project directory, execute `npx cap open ios`. This will open your project in Xcode. From here, you can build and run the application on the selected simulator. 
As alternative, you can open the file `App.xcworkspace` directly in Xcode from `ios/App` folder. 

#### Running on Android Studio Emulator
- Install Android Studio: Make sure you have the latest version of Android Studio.
- Setup Android Emulator: Open Android Studio, go to `Tools > AVD Manager` and create a new Android Virtual Device (AVD) or select an existing one.
- Run the Application: Navigate to your project directory and run `npx cap open android`. This will open your project in Android Studio. Build and run the application on your chosen emulator.
As alternative, you can open the folder `android` directly in Android Studio.

In addition to emulator options, you can also run the wallet directly on a real mobile device, providing a more authentic user experience and testing environment.

## Deployment steps before building
Our DIDComm over LibP2P implementation currently depends on a locally deployed WebRTC relay.
```
docker compose up -d
```

## End to end testing
### Pre-installed on local:

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
