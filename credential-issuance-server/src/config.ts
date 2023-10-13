// eslint-disable-next-line no-undef
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
// eslint-disable-next-line no-undef
const endpoint = process.env.ENDPOINT ?? `http://10.4.21.37:${port}`; // @TODO: FOR TESTING, CHANGE TO YOUR IP ADDRESS
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
  },
};

export { config };
