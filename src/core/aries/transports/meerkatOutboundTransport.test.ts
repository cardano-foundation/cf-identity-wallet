import { EncryptedMessage } from "@aries-framework/core/build/types";
import {
  Agent,
  AgentDependencies,
  InitConfig,
  OutboundPackage,
} from "@aries-framework/core";
import { CapacitorFileSystem } from "../dependencies";
import { IonicStorageModule } from "../modules";
import { MeerkatTransport } from "./meerkat/meerkatTransport";
import { MeerkatOutboundTransport } from "./meerkatOutboundTransport";

const eventEmitterMock = jest.fn();
const sendMessageMock = jest.fn();
const closeMock = jest.fn();
const endpoint = "test";

jest.mock("./meerkat/meerkatTransport", () => ({
  MeerkatTransport: jest.fn().mockImplementation(() => {
    return {
      getEndpoint: () => endpoint,
      sendMessage: sendMessageMock,
      close: closeMock,
    };
  }),
}));

const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass:
    eventEmitterMock as unknown as AgentDependencies["EventEmitterClass"],
  fetch: null,
  WebSocketClass: {} as unknown as AgentDependencies["WebSocketClass"],
};

const config: InitConfig = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw",
  },
};

let agent: Agent;
let meerkat: MeerkatTransport;
let meerkatOuboundTransport: MeerkatOutboundTransport;
const reqEncryptedMessage: EncryptedMessage = {
  protected: "reqProtected",
  iv: "reqIv",
  ciphertext: "reqCiphertext",
  tag: "reqTag",
};

describe("Meerkats outbound transport test", () => {
  beforeAll(async () => {
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        ionicStorage: new IonicStorageModule(),
      },
    });
    meerkat = new MeerkatTransport(agent);
    meerkatOuboundTransport = new MeerkatOutboundTransport(meerkat);
    agent.registerOutboundTransport(meerkatOuboundTransport);
    await meerkatOuboundTransport.start(agent);
  });

  afterAll(async () => {
    await meerkatOuboundTransport.stop();
  });

  test("should call close meerkat function method when stop transport", async () => {
    await meerkatOuboundTransport.stop();
    expect(closeMock).toBeCalled();
  });

  test("should successfully when sent", async () => {
    const outboundPackage: OutboundPackage = {
      payload: reqEncryptedMessage,
      responseRequested: true,
      endpoint: meerkat.getEndpoint(),
    };
    await expect(
      meerkatOuboundTransport.sendMessage(outboundPackage)
    ).resolves.toBe(undefined);
  });
});
