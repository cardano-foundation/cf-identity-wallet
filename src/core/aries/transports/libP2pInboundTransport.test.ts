import {
  AgentDependencies,
  Agent,
  InitConfig,
} from "@aries-framework/core";
import { CapacitorFileSystem } from "../dependencies";
import { IonicStorageModule } from "../modules";
import {LibP2p} from "./libp2p/libP2p";
import {LibP2pInboundTransport} from "./libP2pInboundTransport";

const eventEmitterMock = jest.fn();

jest.mock("./libp2p/libP2p", () => ({
  LibP2p: {
    libP2p: {
      start: jest.fn(),
      sendMessage: jest.fn(),
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
  beforeAll(async () => {
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
      },
    });
    libP2pInboundTransport = new LibP2pInboundTransport(libP2p);
    await LibP2p.libP2p.start();
    await agent.registerInboundTransport(libP2pInboundTransport);
    await libP2pInboundTransport.start(agent);
  });

  afterAll(async () => {
    await libP2pInboundTransport.stop();
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
        }
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
