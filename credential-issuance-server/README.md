# ID Wallet Issuer Server
#### How to run

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
