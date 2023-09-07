import express from "express";
import {
  HttpOutboundTransport,
  Agent,
  ConsoleLogger,
  LogLevel,
  InitConfig,
  AutoAcceptCredential,
  CredentialsModule,
  V2CredentialProtocol,
  JsonLdCredentialFormatService,
  W3cCredentialsModule,
  WsOutboundTransport,
  CREDENTIALS_CONTEXT_V1_URL, KeyType,
  // KeyType,
} from "@aries-framework/core";
import type { Socket } from "net";
import { Server } from "ws";
import {
  HttpInboundTransport,
  WsInboundTransport,
  agentDependencies,
} from "@aries-framework/node";
import { AskarModule } from "@aries-framework/askar";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";

const port = process.env.AGENT_PORT ? Number(process.env.AGENT_PORT) : 3001;

// We create our own instance of express here. This is not required
// but allows use to use the same server (and port) for both WebSockets and HTTP
const app = express();
const socketServer = new Server({ noServer: true });
// @TODO: config host
const endpoints = process.env.AGENT_ENDPOINTS?.split(",") ?? [
  `http://localhost:${port}`,
  `ws://localhost:${port}`,
];

const agentConfig: InitConfig = {
  endpoints,
  label: "Aries Framework JavaScript",
  walletConfig: {
    id: "test-wallet-1-2",
    key: "DZ9hPqFWTPxemcGea72C1X1nusqk5wFNLq6QPjwXGqAa",
  },
  logger: new ConsoleLogger(LogLevel.debug),
};

// Set up agent
const agent = new Agent({
  config: agentConfig,
  dependencies: agentDependencies,
  modules: {
    // Register the Askar module on the agent
    askar: new AskarModule({
      ariesAskar,
    }),
    credentials: new CredentialsModule({
      credentialProtocols: [
        new V2CredentialProtocol({
          credentialFormats: [new JsonLdCredentialFormatService()],
        }),
      ],
      autoAcceptCredentials: AutoAcceptCredential.Always,
    }),
    w3cCredentials: new W3cCredentialsModule({}),
  },
});
// const config = agent.config;

// Create all transports
const httpInboundTransport = new HttpInboundTransport({ app, port });
const httpOutboundTransport = new HttpOutboundTransport();
const wsInboundTransport = new WsInboundTransport({ server: socketServer });
const wsOutboundTransport = new WsOutboundTransport();
// Register all Transports
agent.registerInboundTransport(httpInboundTransport);
agent.registerOutboundTransport(httpOutboundTransport);
agent.registerInboundTransport(wsInboundTransport);
agent.registerOutboundTransport(wsOutboundTransport);

// Allow to create invitation, no other way to ask for invitation yet
httpInboundTransport.app.get("/invitation", async (req, res) => {
  const { outOfBandInvitation } = await agent.oob.createInvitation({
    autoAcceptConnection: true,
    multiUseInvitation: true,
  });
  // const httpEndpoint = config.endpoints.find((e) => e.startsWith("http"));
  res.send(outOfBandInvitation.toUrl({ domain: `http://localhost:${port}` }));
});

httpInboundTransport.app.get("/ping", async (req, res) => {
  res.send("pong");
});

// W3cJsonLdCredentialService.test.ts
// JsonLdCredentialFormatService.ts
httpInboundTransport.app.get("/credential", async (req, res) => {
  // @TODO: check exist connection ID for return
  const connectionId = req.query.connectionId as string;
  // const dids = await agent.dids.getCreatedDids();
  // console.log(dids);
  const did = await agent.dids.create({
    method: "key",
    options: { keyType: KeyType.Ed25519 },
  });
  console.log(did.didState.did)
  console.log(did)
  const connection = await agent.connections.getById(connectionId);
  console.log(connection.did)
  const w3Credential = await agent.credentials.offerCredential({
    protocolVersion: "v2" as never,
    connectionId: connectionId,
    credentialFormats: {
      jsonld: {
        credential: {
          '@context': [CREDENTIALS_CONTEXT_V1_URL, 'https://www.w3.org/2018/credentials/examples/v1'],
          type: ['VerifiableCredential', 'UniversityDegreeCredential'],
          issuer: did.didState.did as string,
          issuanceDate: '2017-10-22T12:23:48Z',
          credentialSubject: {
            degree: {
              type: 'BachelorDegree',
              name: 'Bachelor of Science and Arts',
            },
          },
        },
        options: {
          proofType: 'Ed25519Signature2018',
          proofPurpose: 'assertionMethod',
        },
      },
    },
    autoAcceptCredential: AutoAcceptCredential.Always,
  });
  res.send(w3Credential);
});

const main = async () => {
  await agent.initialize();
  httpInboundTransport.server?.on("upgrade", (request, socket, head) => {
    socketServer.handleUpgrade(request, socket as Socket, head, (socket) => {
      socketServer.emit("connection", socket, request);
    });
  });
};

main();
