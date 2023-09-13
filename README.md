<div align="center">
  <img src="https://cryptologos.cc/logos/cardano-ada-logo.svg?v=026" alt="Cardano Foundation | Identity Wallet" height="150" />
  <hr />
    <h1 align="center" style="border-bottom: none">Cardano Foundation | Identity Wallet</h1>

![GitHub](https://img.shields.io/github/license/cardano-foundation/cf-identity-wallet)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/cardano-foundation/cf-identity-wallet)

  <hr/>
</div>

# Overview

An open-source Decentralised Identity (DID) and Verifiable Credential (VC) Wallet complying to W3C and DIDComm standards utilising Local-First Software design and development principles. The wallet also features a bespoke Cardano Crypto Wallet.

# Features

TODO

# Running the app

TODO: Rewrite this section

## Mediator service
You can know how to mediator work in [link](https://github.com/hyperledger/aries-cloudagent-python/blob/main/Mediation.md#mediator-message-flow-overview).
When deploy mediator services success by docker-compose, you can see invitation URL in log of mediator container:
```console
mediator_1             | Invitation URL (Connections protocol):
mediator_1             | https://localhost:2015?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiZmYwMjkzNmYtNzYzZC00N2JjLWE2ZmYtMmZjZmI2NmVjNTVmIiwgImxhYmVsIjogIk1lZGlhdG9yIiwgInJlY2lwaWVudEtleXMiOiBbIkFyVzd1NkgxQjRHTGdyRXpmUExQZERNUXlnaEhXZEJTb0d5amRCY0UzS0pEIl0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cHM6Ly9lZDQ5LTcwLTY3LTI0MC01Mi5uZ3Jvay5pbyJ9
```
You can fill it into [ariesAgent.ts](https://github.com/cardano-foundation/cf-identity-wallet/blob/f2733cfdc962583fb962f12006e0c9e27ea113ef/src/core/aries/ariesAgent.ts#L98) to use mediator for communicate multi agents.

## Deployment steps before building
At present to create KERI AIDs we use a combination of KERIA and Signify-TS.
KERIA for now is deployed locally in Docker Compose and pushes key event material to a KERI cardano-backer running on our AWS account.
To launch KERIA:
```
docker compose up -d
```

# Building the app

TODO

# Testing

TODO: rewrite this section

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

# Contributing

All contributions are welcome. Feel free to open a new thread on the issue tracker or submit a new pull request. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. Thanks!

# Additional Docs
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [CHANGELOG.md](CHANGELOG.md)