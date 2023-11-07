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

- npm and node js
- android emulator for samsung galaxy s23 ultra is configured or ios simulator for iphone 15 pro / 15 pro max
- add .env to root folder with APP_PATH property with path to app build for chosen platform e.g.

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

### Generate icons

Install cordova resources tool:
```
npm install -g cordova-res
```

Create a `resources` folder in the root directory with:
- icon.png (1024x1024)
- splash.png (2732x2732)

For iOS: 
```
cordova-res ios --skip-config --copy
```
For Android: 
```
cordova-res Android --skip-config --copy
```
Known [issue](https://github.com/ionic-team/capacitor-assets/issues/137) from Capacitor requires to set icons manually in Android Studio.
