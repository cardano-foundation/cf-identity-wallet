<div align="center">
  <img src="src/assets/icon-only.png" alt="Cardano Foundation | Identity Wallet" height="150" />
  <hr />
    <h1 align="center" style="border-bottom: none">Cardano Foundation | Identity Wallet</h1>

![GitHub](https://img.shields.io/github/license/cardano-foundation/cf-identity-wallet)
![Discord](https://img.shields.io/discord/1022471509173882950)

  <hr/>
</div> 

# Disclaimer

<div align="justify"> 
<b> Please be aware that your access to and use of the Open-Source Identity Wallet, including any content you may encounter, is subject to your own discretion and risk. Currently, the identity wallet is under-development with security audits and threat modelling still pending. It is essential to understand, this version of the identity wallet does not currently feature encryption-at-rest, nor does it offer robust recovery or backup solutions. Furthermore, any seed phrase generated during the onboarding process is currently not being utilised. We are in the process of reviewing the ideal key management and social recovery methodologies for development in 2024. </b>
</div>
<br>
<div align="center">   
 <b>   :heavy_exclamation_mark:  The Open-Source Identity Wallet is provided to you on an "as is" and "as available" basis.  </b>
</div>
<br>
<div align="justify">    
<b> While we strive for high functionality and user satisfaction and endeavour to maintain reliability and accuracy, unforeseen issues may arise due to the experimental nature of this product. For detailed information on the terms and conditions that govern your use of the Open-Source Identity Wallet, we encourage you to read our Terms of Use. </b>
</div>

<br>

# Overview

<div align="justify"> 
<b> The Identity Wallet is an open source application developed by the Cardano Foundation. This project is the result of ongoing research and development pertaining to the principles of Self-Sovereign Identity (SSI), Self-Certifying Identifiers (SCIs), Verifiable Data Registries (VDRs), and the standards, frameworks, and implementations available within the Cardano ecosystem and externally. The first release of Identity Wallet provides an open source reference implementation demonstrating the Key Event Receipt Infrastructure (KERI) on Cardano. </b>
</div>

<br>

<p align="center">
  <kbd> 
      <img src="docs/images/readme/User-Flow-Preview.jpg" alt="User Flow Preview" width="720"/>
  </kbd>
</p>

<br>

# Features

- :iphone: Android & iOS Support with native biometrics
- :cloud: High messaging availability with a KERIA cloud agent
- :closed_lock_with_key: Secure Enclave (SE) / Trusted Execution Environment (TEE) usage for seeds & secrets
- :id: KERI autonomic identifiers
  - Direct-mode, witness-backed, Cardano-backed
  - Single-sig, multi-sig
- :ticket: ACDC credentials exchanged using the IPEX protocol
- :zap: Efficient over-the-wine communications using CESR encoding
- :desktop_computer: dApp integration using [CIP-45](https://cips.cardano.org/cip/CIP-0045)
  
 # Future Developments
 
- Encryption at rest with local backup & restore (Compatible with Hyperledger [Aries Askar](https://github.com/hyperledger/aries-askar))
- Social and multi-device identifier recovery
- P2P Chat
- Delegated multi-sig for organisational identity
- Cardano-backed ACDC verifiable credential schemas

# Standards & Protocols
- [Key Event Receipt Infrastructure (KERI)](https://keri.one/)
- [Trust Over IP - Authentic Chained Data Container (ACDC)](https://trustoverip.github.io/tswg-acdc-specification/)
- [Composable Event Streaming Representation (CESR)](https://weboftrust.github.io/ietf-cesr/draft-ssmith-cesr.html)

# SSI Services
- [KERIA Cloud Agent](https://github.com/cardano-foundation/keria)
- [Signify-TS Edge Client](https://github.com/cardano-foundation/signify-ts)
- [Verifiable Credential Testing Tool](https://dev.credentials-ui.cf-keripy.metadata.dev.cf-deployments.org/)
- [KERI on Cardano](https://github.com/cardano-foundation/cardano-backer)

# Architecture
<div align="center"> 
  <p>
    <a href="https://raw.githubusercontent.com/cardano-foundation/cf-identity-wallet/main/docs/images/readme/Architecture-Diagram.svg">
    <img src="docs/images/readme/Architecture-Diagram.svg" alt="Identity Wallet Architecture">
    </a>  
  </p>     
</div>

# User Flows
In this section, you'll find detailed PDF documents outlining the various user flows within our application. These user flows serve as comprehensive guides, illustrating the application's user journeys step-by-step. Please feel free to explore and gain insight into the following user flows:
- [Introduction](https://drive.google.com/file/d/1_Oem0Wu_U8XPyfpzzKX8A0ZHJN0jztDx/view?usp=drive_link)
- [Onboarding](https://drive.google.com/file/d/1lMNwS30oq9X_rKVGvB3hHXDpcztPC7sy/view?usp=drive_link)
- [Recovery](https://drive.google.com/file/d/1JzgIY0SztyM-3mHstOZAu2Y6DtevrAyc/view?usp=drive_link)
- [Login](https://drive.google.com/file/d/1dky8DUNRPDkzmplftRwA9VfK-puVU5SC/view?usp=drive_link)
- [Identifiers](https://drive.google.com/file/d/15Shxt8B0bmZjs5465Z9w976Luc1ySkEX/view?usp=drive_link)
- [Connections](https://drive.google.com/file/d/1k2LSycp24vbMosVBSducWGScNyMt0Ge9/view?usp=drive_link)
- [Credentials](https://drive.google.com/file/d/17Ws8l5zyOZFYDrqw277nklERYw0I8Sn6/view?usp=drive_link)
- [Scan](https://drive.google.com/file/d/1ugZWy5pqakr6uJACWxTc6QqxZIU-JOeM/view?usp=drive_link)
- [Notifications](https://drive.google.com/file/d/1tdu46c1ioB5D3b_tFjNxPwcBd1ZuHviU/view?usp=drive_link)
- [Menu & Settings](https://drive.google.com/file/d/1UF98ttKIxaPqxrjDDDZwp9QNtwfVwtnZ/view?usp=drive_link)
- [Cardano Connect](https://drive.google.com/file/d/1KNt8Fb8VGqnq_p6EY0nEog7WDR07BX3T/view?usp=drive_link)
- [Verify Options](https://drive.google.com/file/d/1akOEf1GRGvVd4vNcWFNF4KOox5iuXOnv/view?usp=drive_link)

# Getting Started

## Requirements
- Node.js: Version 18.20.4.
- npm: Compatible with the Node.js version.
- Xcode: For iOS emulation (latest version recommended).
- Android Studio: For Android emulation (latest version recommended).
- Capacitor: Version 6.0.0 (refer to package.json). For detailed environment setup, refer to the [Capacitor Environment Setup Guide](https://capacitorjs.com/docs/getting-started/environment-setup).
- Mobile Device: iOS or Android for running the app on physical devices.
- Docker, Docker Compose.

Ensure that your system meets these requirements to successfully use and develop the Identity Wallet application.

### Cloning the Repository

```bash
git clone https://github.com/cardano-foundation/cf-identity-wallet.git
cd cf-identity-wallet
make init # This will configure the git hooks
```

## Preparing the App
This project uses a specific node version (check the requirements section above). You can optionally use [nvm](https://github.com/nvm-sh/nvm) to manage and switch between different Node.js versions on your computer.

Before running the App, ensure that all dependencies are installed and the app is built properly. 
In the project root directory, run the following commands:
```bash
npm install
```
## Running in the Browser
The development server depends on a local KERIA and credential issuance server setup.
The [Docker Compose](./docker-compose.yaml) file can be used to quickly bring these services up.

```bash
docker-compose up -d --build
npm run dev
```
This command starts the development server and allows you to preview the application on your browser by opening this localhost address:

[http://localhost:3003/](http://localhost:3003/)

## Running in an Emulator
You can discover how to run the application in an emulator by following this [link](docs/Running-in-an-Emulator.md).

## End-to-End (E2E) Testing
You can gain additional insights into end-to-end testing by visiting the provided [link](docs/Testing.md).

# Contributing

All contributions are welcome! Please feel free to open a new thread on the issue tracker or submit a new pull request.


Please read [Contributing](CONTRIBUTING.md) in advance.  Thank you for contributing!

## Additional Documents
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)


# Troubleshooting
<div align="justify"> 
Please be aware that from time-to-time the hosted pre-production KERI services require restarting.  When this occurs it causes a white-screen when launching the application.  If you experience the white-screen issue please wait for the services to restart and the application will load as expected.   If you have any questions, there is also a Discord Channel available for the Identity Wallet.   
</div>

<br>

<div align="center"> 
      <a href="https://discord.gg/Wh25yBqwpz">👨‍💻 Join our Discord! 👩‍💻<a>
</div>


# Resources

## KERI
- [Key Event Receipt Infrastructure](https://keri.one/)
- [Resources](https://keri.one/keri-resources/)
- [KERIA](https://github.com/cardano-foundation/keria)
- [Signify-TS](https://github.com/cardano-foundation/signify-ts)
- [Cardano Backer](https://github.com/cardano-foundation/cardano-backer)

## Standards, Frameworks and Governance
- [SSI Frameworks Overview](https://europeanblockchainassociation.org/ssi-frameworks-sdks-overview/)
- [Global Legal Entity Identifier Foundation (GLIEF)](https://www.gleif.org/en)
- [Decentralized Identity Foundation](https://identity.foundation/)
- [eIDAS Regulation](https://digital-strategy.ec.europa.eu/en/policies/eidas-regulation)
- [European Blockchain Services Infrastructure (EBSI)](https://ec.europa.eu/digital-building-blocks/wikis/display/EBSI/Home)
