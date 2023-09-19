// eslint-disable-next-line no-undef
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
// eslint-disable-next-line no-undef
const endpoint = process.env.ENDPOINT ?? `http://localhost:${port}`;
const config = {
  endpoint: endpoint,
  endpoints: [endpoint],
  port,
  path: {
    ping: "/ping",
    invitation: "/invitation",
    credential: "/credential",
    invitationWithCredential: "/offerCredentialWithConnection",
    invitationWithCredentialConnectionless:
      "/offerCredentialWithConnectionLess",
  },
};

export { config };
