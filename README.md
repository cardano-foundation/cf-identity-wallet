<div align="center">
  <img src="src/assets/icon-only.png" alt="Cardano Foundation | Identity Wallet" height="150" />
  <hr />
    <h1 align="center" style="border-bottom: none">Cardano Foundation | Identity Wallet</h1>

![GitHub](https://img.shields.io/github/license/cardano-foundation/cf-identity-wallet)
![Discord](https://img.shields.io/discord/1022471509173882950)

  <hr/>
</div> 

# Disclaimer

<div style="text-align: justify">
<b>Please be aware that your access to and use of the Open-Source Identity Wallet, including any content you may encounter, is subject to your own discretion and risk. Currently, the identity wallet is under development and a security audit has not been conducted. It is essential to understand, this version of the identity wallet does not currently feature encryption-at-rest, nor does it offer robust recovery or backup solutions. The Open-Source Identity Wallet is provided to you on an "as is" and "as available" basis. While we strive for high functionality and user satisfaction and endeavour to maintain reliability and accuracy, unforeseen issues may arise due to the experimental nature of this product. For detailed information on the terms and conditions that govern your use of the Open-Source Identity Wallet, we encourage you to read our Terms of Use. </b>
</div>

<br>

# Overview

<div style="text-align: justify">
The Identity Wallet is an open source application developed by the Cardano Foundation.  It provides a digital solution for users to securely store, manage, and share their identifiers and verifiable credentials using a mobile device.  This project is the result of on-going research and development pertaining to the principles of Self-Sovereign Identity (SSI), Decentralized Identifiers (DIDs), Self-Certifying Identifiers (SCIs), Verifiable Credentials, Verifiable Data Registries (VDRs) and the standards, frameworks and implementations available within the Cardano ecosystem and externally.  The release of Identity Wallet version 0.1.0 provides an open source reference implementation demonstrating W3C Decentralized Identifiers, Verifiable Credentials, and Key Event Receipt Infrastructure (KERI) on Cardano.
</div>

#### Click the image below to watch our overview video

<p align="center">
  <a href="https://drive.google.com/file/d/1So8bW7dgprOFgKs8PQKQ7c8Sm1Kd8aWW/view?usp=sharing">
    <img src="docs/images/readme/Introduction-Video-Thumbnail.jpg" alt="Identity Wallet Introduction Video Thumbnail">
  </a>
</p>

# Current Features

- **User-Friendly Interface**
  - Intuitive UI/UX developed following proven design principles
  - Android and iOS supported
- **Secure Identity Storage**
  - Hardware Security Module (HSM) or Secure Enclave (SE) on the user’s mobile device us utilsed to securely store private key material
  - Hierarchical Deterministic (HD) wallet,  users can leverage a BIP-39 mnemonic seed phrase for their Identity Wallet profile
- **Interoperability**
  - Compliant and interoperable with the [Aries RFCs](https://github.com/hyperledger/aries-rfcs)
  - [W3C](https://www.w3.org/)
    - [DID Methods](https://www.w3.org/TR/did-spec-registries/)
    - [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
  - [DIDComm](https://github.com/decentralized-identity/didcomm-messaging) v1 Mediator
  - [KERI](https://keri.one/) on Cardano
    - [AID](https://identity.foundation/keri/docs/Glossary.html#autonomic-identifier)
    - [ACDC](https://wiki.trustoverip.org/display/HOME/ACDC+%28Authentic+Chained+Data+Container%29+Task+Force)
  - [Global Legal Entity Identifier Foundation](https://www.gleif.org/en) (GLIEF)
    - [LEI](https://www.gleif.org/en/about-lei/introducing-the-legal-entity-identifier-lei) 
    - [vLEI](https://www.gleif.org/en/vlei/introducing-the-verifiable-lei-vlei)
- **Identity Standards and Protocols**
  - Identifiers
    - W3C Registered DID Methods
      - [did:key](https://w3c-ccg.github.io/did-method-key/)
      - [did:peer](https://identity.foundation/peer-did-method-spec/)
    - KERI 
      - [Autonomic Identifier](https://weboftrust.github.io/WOT-terms/docs/glossary/autonomic-identifier) (AID)
  - Verifiable Credentials
    - [W3C](https://www.w3.org/TR/vc-data-model/#ecosystem-overview)
    - [Autonomous Chained Data Container (ACDC)](https://github.com/trustoverip/tswg-acdc-specification)
- **Connections and Issuance Services**
  - [Connections](https://www.w3.org/TR/vc-data-model/#roles) 
    - Holder-to-Holder
    - Issuer-to-Holder
  - Issuance
    - Credential Issuance Testing Tool [VERCEL_URL]
      - [W3C](https://www.w3.org/TR/vc-data-model/)
      - [ACDC](https://github.com/trustoverip/tswg-acdc-specification)
- **SSI Agents**
  - Hyperledger Aries Framework
    - [Aries Framework JavaScript](https://github.com/hyperledger/aries-framework-javascript) (written in TypeScript)
  - KERI on Cardano
    - [Signify](https://github.com/cardano-foundation/signify-ts)
    - [KERIA](https://github.com/cardano-foundation/keria)
    - [Cardano Backer](https://github.com/cardano-foundation/cardano-backer)

# Potential Future Development
**App Features**
- Bluetooth
- Biometrics
- NFC

**Identity**
- Recovery
  - Shamir Secret Sharing
  - On-chain Recovery
  - Local Encrypted
  - Cloud-based
- Identifiers
  - [did:webs](https://labs.hyperledger.org/labs/didwebs.html#:~:text=did%3Awebs%20extends%20the%20web,%2C%20X509%2C%20and%20certificate%20authorities.)
  - [did:keri](https://identity.foundation/keri/did_methods/)
- Verifiable Credentials
  - [OID4vc](https://openid.net/sg/openid4vc/specifications/)
  - On-chain Schemas

 **Communications**
- Connections
  - Secure Messaging
  - Social Recovery
- DIDComm
  - Mediator v2
 
**Peer-to-Peer (P2P)**
- [CIP-45](https://github.com/cardano-foundation/CIPs/pull/395) Support
- D’App Identity Wallet Integration

**Development Workstreams**
- Identity Wallet Browser Extension
- Cryptocurrency
  - Deep Links into existing wallets
  - Provide open source reference implementations
    - Bundle Transactions
    - Multi-sig


# Preview in your browser

**Disclaimer: Try it now provides access to a preview version of the identity wallet in your browser. This preview version is <ins>not intended</ins> to be used for any purposes other than previewing the application.**

Access the latest version of the Identity Wallet application [here](https://cf-identity-wallet.vercel.app).

To experience this app like it was designed for smarthpones, you can follow this structions:
1. Open the developer options by pressing the ``` F12 ``` key on your keyboard or by right-clicking anywhere on the page, then choose ``` Inspect ``` from the context menu.
2. To Switch to a mobile view:
    - Chrome:
        <details>
          <summary>Click on the icon in the top right corner, as shown in the image below.</summary>
          <img src="docs/images/readme/Chrome-Mobile-View-1.png" alt="Chrome Mobile View 1"/>
        </details>
        <details>
          <summary>Click on <b>Dimensions</b> and select <b>iPhone 14 Pro Max</b>.</summary>
          <img src="docs/images/readme/Chrome-Mobile-View-2.png" alt="Chrome Mobile View 2"/>
        </details>
    - Firefox:
        <details>
          <summary>Click on the icon in the upper right corner, as shown in the image below, then close the panel.</summary>
          <img src="docs/images/readme/Firefox-Mobile-View-1.png" alt="Firefox Mobile View 1"/>
        </details>
        <details>
          <summary>Click on <b>Dimensions</b> and select <b>Galaxy Note 20</b>.</summary>
          <img src="docs/images/readme/Firefox-Mobile-View-2.png" alt="Firefox Mobile View 2"/>
        </details>

# User Flow

<p align="center">
  <a href="https://drive.google.com/file/d/1So8bW7dgprOFgKs8PQKQ7c8Sm1Kd8aWW/view?usp=sharing">
    <img src="docs/images/readme/User-Flow-Preview.jpg" alt="User Flow Preview" width="720"/>
  </a>
</p>

In this section, you'll find detailed PDF documents outlining the various user flows within our application. These user flows serve as comprehensive guides, illustrating the step-by-step journeys users take while interacting with our app. Feel free to explore and gain insights into the following user flows:
  - [Intro Screens](https://drive.google.com/file/d/1L7ZdQytjQq_BOXP1AZzHM0OhLxt1xbNA/view?usp=sharing)
  - [Onboarding](https://drive.google.com/file/d/1vB9NoWJG2ok9HB89wlbS0fLbPjLavudl/view?usp=sharing)
  - [Onboarded](https://drive.google.com/file/d/1NCexApVn-njVFmN6wBPiDN1oX0DzcvSn/view?usp=sharing)
  - [Identity](https://drive.google.com/file/d/1RxkB5zM-xXbh7WcSWu9u1xbBMRDg3q9i/view?usp=sharing)
  - [Connections](https://drive.google.com/file/d/1bVZPUgKmfPuIOraqDUyMMj_Dz3GGmLG2/view?usp=sharing)
  - [Credentials](https://drive.google.com/file/d/18TfwGaLXSLxuaHjJlbAmkRnFF-2ktrFT/view?usp=sharing)
  - [Verify Options](https://drive.google.com/file/d/1akOEf1GRGvVd4vNcWFNF4KOox5iuXOnv/view?usp=sharing)
  - [Scan](https://drive.google.com/file/d/1BDr2l8ptnsAdL2lAWf8x2-KwN48lqXVz/view?usp=sharing)


# Getting Started

## Requirements
- Node.js: Version 18.16.0 or higher.
- npm: Compatible with the Node.js version.
- Xcode: For iOS emulation (latest version recommended).
- Android Studio: For Android emulation (latest version recommended).
- Capacitor: Version 4.8.1 (refer to package.json). For detailed environment setup, refer to the [Capacitor Environment Setup Guide](https://capacitorjs.com/docs/getting-started/environment-setup).
- Mobile Device: iOS or Android for running the app on physical devices.
- Docker (only required for running locally deployed WebRTC relay).

Ensure that your system meets these requirements to successfully use and develop the Identity Wallet application.

### Cloning the Repository

```bash
git clone https://github.com/cardano-foundation/cf-identity-wallet.git
cd cf-identity-wallet
```
## Deployment before Building the App
Our DIDComm over LibP2P implementation currently depends on a locally deployed WebRTC relay.
```
cd cf-identity-wallet
docker compose up -d
```
## Preparing the App
Before running the App, ensure that all dependencies are installed and the app is built properly. 
In the project root directory, run the following commands:
```bash
npm install
```
## Running in the Browser
```bash
npm run dev
```
## Running in an Emulator
### Building the App
```bash
npm run build
```
### Prepare Capacitor: This command will sync all changes to iOS and Android.
```bash
npm run build:cap
```
### Running on Xcode Emulator
- Install Xcode: Ensure you have the latest version of Xcode installed on your Mac.
- Open the iOS Simulator: Open Xcode, navigate to `Xcode > Open Developer Tool > Simulator`.
- Select the desired iOS Device: Choose an iOS device model from the simulator list.
- Run the Application: In your project directory, execute `npx cap open ios`. This will open your project in Xcode. From here, you can build and run the application on the selected simulator. 
As alternative, you can open the file `App.xcworkspace` directly in Xcode from `ios/App` folder. 

### Running on Android Studio Emulator
- Install Android Studio: Make sure you have the latest version of Android Studio.
- Setup Android Emulator: Open Android Studio, go to `Tools > AVD Manager` and create a new Android Virtual Device (AVD) or select an existing one.
- Run the Application: Navigate to your project directory and run `npx cap open android`. This will open your project in Android Studio. Build and run the application on your chosen emulator.
As alternative, you can open the folder `android` directly in Android Studio.

In addition to using the emulators, you can also run the identity wallet directly on a real mobile device, providing a more authentic user experience and testing environment.  This approach requires the device to be tethered via cable to your computer running Xcode and/or Android Studio and the developer options must be enabled.  For further instructions: [Xcode](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device) and [Android Studio](https://developer.android.com/studio/run/device).

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
- Create .env file in your local root project folder with APP_PATH property with path to app build for chosen platform
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
3. Set ALLURE_RESULTS_DIR on your local
```
ALLURE_RESULTS_DIR=tests/.reports/allure-results
```
4. Generate allure report
```
allure generate $ALLURE_RESULTS_DIR -o tests/.reports/allure-report --clean
```
5. Open allure report
```
allure open tests/.reports/allure-report
```

# Contributing

All contributions are welcome. Feel free to open a new thread on the issue tracker or submit a new pull request. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. Thanks!

## Additional Documents
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [CHANGELOG.md](CHANGELOG.md)

# Resources
