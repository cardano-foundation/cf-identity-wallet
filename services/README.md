## External services
At the moment, our wallet depends on a number of services (external to this project or developed by us) which will generally run in the cloud:
- KERIA (KERI Cloud Agent),
- AFJ Mediator
- Credential issuance server (from this repo)

This directory is incomplete for now - missing:
- Full Traefik config,
- `aries-mediator-service/afj` fork for building dist within Dockerfile and `{ multiUseInvitation: true }` config

This deployment is for now separate from the KERI `cardano-backer` deployment but should be consolidated to a single Traefik deployment.
