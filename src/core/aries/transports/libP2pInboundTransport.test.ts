import {
  AgentDependencies,
  Agent,
  InitConfig,
} from "@aries-framework/core";
import { CapacitorFileSystem } from "../dependencies";
import { IonicStorageModule } from "../modules";
import {LibP2p, LIBP2P_RELAY, schemaPrefix} from "./libp2p/libP2p";
import {LibP2pInboundTransport} from "./libP2pInboundTransport";

const eventEmitterMock = jest.fn();
const peerId = "12D3KooWBneTYQJQPYSh8pvkSuoctUjkeyoEjqeY7UEsbpc5rtm4";
const endpoint = `${schemaPrefix}${LIBP2P_RELAY}/p2p-circuit/webrtc/p2p/${peerId}`

jest.mock("./libp2p/libP2p", () => ({
  LibP2p: {
    libP2p: {
      start: jest.fn(),
      sendMessage: jest.fn(),
      handleInboundMessage: jest.fn(),
      advertising: jest.fn(),
      setUsageStatusOfInbound: jest.fn(),
      getEndpoint: jest.fn(() => endpoint),
      stop: jest.fn(),
    },
  },
}));


const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass:
    eventEmitterMock as unknown as AgentDependencies["EventEmitterClass"],
  fetch: null,
  WebSocketClass:
    {} as unknown as AgentDependencies["WebSocketClass"],
};


let agent: Agent;
const libP2p = LibP2p.libP2p;
const config: InitConfig = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw",
  },
};
let libP2pInboundTransport: LibP2pInboundTransport;

const data: unknown = {
  data: "Mock data"
};

describe("LibP2p webrtc inbound transport test", () => {
  beforeAll(() => {
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
      },
    });
    libP2pInboundTransport = new LibP2pInboundTransport(libP2p);
  })

  test("should successfully start", async () => {
    await LibP2p.libP2p.start();
    await agent.registerInboundTransport(libP2pInboundTransport);
    await expect(libP2pInboundTransport.start(agent)).resolves.toBeUndefined();
  });

  test("should successfully start with libP2p function error", async () => {
    const advertisingMockFn = jest.spyOn(LibP2p.libP2p, "advertising");
    advertisingMockFn.mockRejectedValue(new Error("Mock error"));
    await expect(libP2pInboundTransport.start(agent)).resolves.toBeUndefined();
  });

  test("should successfully stop", async () => {
    await LibP2p.libP2p.start();
    await agent.registerInboundTransport(libP2pInboundTransport);
    await expect(libP2pInboundTransport.stop()).resolves.toBeUndefined();
  });


  test("should throw Error when received unrecognized format message", async () => {
    await expect(libP2pInboundTransport.receiveMessage(data)).rejects.toThrowError(
      "Unable to parse incoming message: unrecognized format");
  });

  test("should successfully when received message", async () => {
    const agent = jest.fn().mockReturnValue({
      registerInboundTransport: jest.fn(),
      config: {
        logger: {
          warn: jest.fn(),
          info: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
        },
        endpoints: jest.fn(),
      },
      receiveMessage: jest.fn(),
    });
    const agentInstance = agent();
    libP2pInboundTransport = new LibP2pInboundTransport(libP2p);
    await LibP2p.libP2p.start();
    await agentInstance.registerInboundTransport(libP2pInboundTransport);
    await libP2pInboundTransport.start(agentInstance);
    await expect(libP2pInboundTransport.receiveMessage(data)).resolves.toBe(undefined);
  });
});
