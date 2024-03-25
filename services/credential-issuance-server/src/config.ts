// eslint-disable-next-line no-undef
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
// eslint-disable-next-line no-undef
const endpoint = process.env.ENDPOINT ?? `http://127.0.0.1:${port}`;
const config = {
  endpoint: endpoint,
  endpoints: [endpoint],
  port,
  path: {
    ping: "/ping",
    shorten: "/shorten/:id",
    createShorten: "/shorten",
    keriOobi: "/keriOobi",
    issueAcdcCredential : "/issueAcdcCredential",
    schemaOobi: "/oobi/:id",
    contacts: "/contacts",
    resolveOobi: "/resolveOobi",
    requestDisclosure: "/requestDisclosure",
  },
};

export { config };
