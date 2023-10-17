import {
  AgentDependencies,
  Agent,
  InitConfig,
  OutboundPackage,
  EncryptedMessage,
} from "@aries-framework/core";
import { CapacitorFileSystem } from "../dependencies";
import { IonicStorageModule } from "../modules";
import { LibP2p } from "./libp2p/libP2p";
import { LibP2pOutboundTransport } from "./libP2pOutboundTransport";
import * as libP2pPeer from "./libP2p.peer";

const eventEmitterMock = jest.fn();

const peerId = "12D3KooWCuC2hFFcpB2H1VwVDsAfakFgkgoaH8ZReJsz1ieE7JSX";
jest.mock("./libp2p/libP2p", () => ({
  LibP2p: {
    libP2p: {
      start: jest.fn(),
      getEndpoint: (peerId: string) =>
        `libp2p://dns/libp2p-relay-9aff91ec2cbd.herokuapp.com/tcp/443/wss/p2p/12D3KooWH7RNURD6v8DdiJdUpydLgDAP5PcSsw5NhVT8E3GgG9Wx/p2p-circuit/webrtc/p2p/${peerId}`,
      sendMessage: jest.fn(),
      setUsageStatusOfOutbound: jest.fn(),
      stop: jest.fn(),
      getPeerJson: jest.fn(),
    },
  },
}));
const savePeer = jest.spyOn(libP2pPeer, "savePeer");
savePeer.mockResolvedValue(undefined);
const getPeerFromStorage = jest.spyOn(libP2pPeer, "getPeerFromStorage");

const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass:
    eventEmitterMock as unknown as AgentDependencies["EventEmitterClass"],
  // eslint-disable-next-line no-undef
  fetch: global.fetch as unknown as AgentDependencies["fetch"],
  WebSocketClass: {} as unknown as AgentDependencies["WebSocketClass"],
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
let libP2pOutboundTransport: LibP2pOutboundTransport;
const endpoint = LibP2p.libP2p.getEndpoint(peerId);

const reqEncryptedMessage: EncryptedMessage = {
  protected: "reqProtected",
  iv: "reqIv",
  ciphertext: "reqCiphertext",
  tag: "reqTag",
};

describe("LibP2p webrtc outbound transport test", () => {
  beforeAll(async () => {
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
      },
    });
    libP2pOutboundTransport = new LibP2pOutboundTransport(libP2p);
    await LibP2p.libP2p.start();
  });

  afterAll(async () => {
    await libP2pOutboundTransport.stop();
  });

  test("should successfully start when first run", async () => {
    await LibP2p.libP2p.start();
    getPeerFromStorage.mockResolvedValue(null);
    agent.registerOutboundTransport(libP2pOutboundTransport);
    await expect(libP2pOutboundTransport.start(agent)).resolves.toBeUndefined();
  });

  test("should successfully start when second run", async () => {
    await LibP2p.libP2p.start();
    getPeerFromStorage.mockResolvedValue("{}");
    agent.registerOutboundTransport(libP2pOutboundTransport);
    await expect(libP2pOutboundTransport.start(agent)).resolves.toBeUndefined();
  });

  test("should successfully when sent", async () => {
    await libP2pOutboundTransport.start(agent);
    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint,
    };
    await expect(
      libP2pOutboundTransport.sendMessage(outboundPackage)
    ).resolves.toBe(undefined);
  });
});
