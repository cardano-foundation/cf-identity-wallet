# ID Wallet Issuer Server
This server runs an Aries and Signify agent to act as an issuance server for both W3C credentials and ACDCs (KERI eco-system).
Right now, this is only used for testing purposes for the wallet - it is not meant as a full blown issuance server - hence there are no tests in this module.

### How to run (development)
1. Install dependencies (nodejs >= v18):
   `npm install`
2. Run development server:
    `npm run start:dev`
3. Build code and run the built server:
   `npm build`&& `npm start`
4. CLI
   - `npm run cli:invitation` - get OOB invitation
   - `npm run cli:offer-credential` - issue credential with connection
   - `npm run cli:offer-credential-connection-less` - issue credential without connection
5. CLI with another credential
   - `npm run cli:offer-credential degree-credential.json`
   - `npm run cli:offer-credential-connection-less degree-credential.json`
   - `npm run cli:offer-credential degree-credential-with-expiration.json`
   - `npm run cli:offer-credential-connection-less degree-credential-with-expiration.json`
   - `npm run cli:offer-credential resident-card-with-expiration.json`
   - `npm run cli:offer-credential summit-access-pass.json`

The CLI may also be used locally to point at a remotely deployed server by setting the `ENDPOINT` environment variable. (default is `http://1237.0.0.1:3001`)
