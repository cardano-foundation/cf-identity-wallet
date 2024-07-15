// @ts-ignore
const port = window._env_.REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT;
// @ts-ignore
const url = window._env_.REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL;
const endpoint = `${url}:${port}`;

const config = {
  endpoint: endpoint,
  endpoints: [endpoint],
  port,
  path: {
    ping: "/ping",
    getConnectionByDid: "/getConnectionByDid",
    invitation: "/invitation",
    credential: "/credential",
    invitationWithCredential: "/offerCredentialWithConnection",
    invitationWithCredentialConnectionless:
      "/offerCredentialWithConnectionLess",
    shorten: "/shorten/:id",
    createShorten: "/shorten",
    credentials: {
      summit: "/credentials/schemas/summit/v1",
    },
    keriOobi: "/keriOobi",
    issueAcdcCredential: "/issueAcdcCredential",
    schemaOobi: "/oobi/:id",
    contacts: "/contacts",
    resolveOobi: "/resolveOobi",
    requestDisclosure: "/requestDisclosure",
  },
};

export { config };