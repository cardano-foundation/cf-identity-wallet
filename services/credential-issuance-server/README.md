# ID Wallet Issuer Server
Right now, this is only used for testing purposes for the wallet - it is not meant as a full blown issuance server - hence there are no tests in this module.

### How to run (development)
1. Install dependencies (nodejs >= v18):
   `npm install`
2. Run development server:
    `npm run start:dev`
3. Build code and run the built server:
   `npm build`&& `npm start`
4. CLI
   - `npm run cli:keri-oobi` - get OOBI invitation

The CLI may also be used locally to point at a remotely deployed server by setting the `ENDPOINT` environment variable. (default is `http://1237.0.0.1:3001`)
