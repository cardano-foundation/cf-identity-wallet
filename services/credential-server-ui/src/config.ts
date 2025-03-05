interface CustomWindow extends Window {
  _env_?: {
    REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT?: string;
    REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL?: string;
  };
}

declare let window: CustomWindow;

const port =
  (typeof window !== "undefined" &&
    window._env_?.REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT) ||
  process.env.REACT_APP_CREDENTIAL_ISSUANCE_SERVER_PORT ||
  "3001";

const url =
  (typeof window !== "undefined" &&
    window._env_?.REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL) ||
  process.env.REACT_APP_CREDENTIAL_ISSUANCE_SERVER_URL ||
  "http://localhost";

const endpoint = `${url}:${port}`;

const config = {
  endpoint: endpoint,
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
    deleteContact: "/deleteContact",
    contactCredentials: "/contactCredentials",
    resolveOobi: "/resolveOobi",
    requestDisclosure: "/requestDisclosure",
    revokeCredential: "/revokeCredential",
  },
};

export { config };
