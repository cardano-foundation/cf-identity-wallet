## Cloud services
At the moment, our wallet depends on a number of cloud services:
- KERIA (KERI Cloud Agent),
- AFJ Mediator

This directory is incomplete for now - missing:
- Full Traefik config,
- `aries-mediator-service/afj` fork for building dist within Dockerfile and `{ multiUseInvitation: true }` config

This deployment is for now separate from the KERI `cardano-backer` deployment but should be consolidated to a single Traefik deployment.
