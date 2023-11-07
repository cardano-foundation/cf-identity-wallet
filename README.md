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
### `npm run start-appium`

When you run the appium command, it starts the Appium server, which listens for incoming connections on a specified port. In this case, the --port 4003 option is used to specify that the Appium server should listen on port 4003.

### `npm run e2e:web`

Runs the WebdriverIO test runner with the provided TypeScript configuration file in watch mode, continuously executing the tests and monitoring for changes in the test files or configuration. The SERVE_PORT and TS_NODE_PROJECT environment variables are set to specify the server port and TypeScript configuration, respectively.

#### How to run the end2ends in local

1. Start Appium server in terminal A:
   `npm run start-appium`
2.  Run the web server in terminal B:
    `npm run dev`
3. Run the test in terminal C:
    `npm run e2e:web`

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
