import { SignifyClient, ready as signifyReady, Tier } from "signify-ts";
import { AgentUrls } from "./agent.types";
import { Agent } from "./agent";
import { KeyStoreKeys, SecureStorage } from "../storage";
import { CoreEventEmitter } from "./event";
import { EventTypes } from "./event.types";
import { mnemonicToEntropy } from "bip39";

jest.mock("signify-ts", () => ({
  SignifyClient: jest.fn(),
  ready: jest.fn(),
  Tier: { low: "low" },
}));

const eventEmitter = new CoreEventEmitter();
eventEmitter.emit = jest.fn().mockImplementation(() => Promise.resolve());
jest.mock('bip39', () => ({
  mnemonicToEntropy: jest.fn(),
}));

const mockAgentServicesProps = {
  eventEmitter: eventEmitter,
};

const mockGetBranValue = "AEsI_2YqNsQlf8brzDJaP";
const getKeyStoreSpy = jest.spyOn(SecureStorage, "get").mockResolvedValue(mockGetBranValue);
const mockBasicStorageService = {
  save: jest.fn()
}
const mockEntropy = '00000000000000000000000000000000';

describe("test cases of bootAndConnect function", () => {
  let agent: Agent;
  let mockAgentUrls: AgentUrls;
  let mockSignifyClient: any;

  beforeEach(() => {
    mockSignifyClient = {
      boot: jest.fn(),
      connect: jest.fn(),
    };
    (SignifyClient as jest.Mock).mockImplementation(() => mockSignifyClient);
    agent = Agent.agent;
    (agent as any).basicStorageService = mockBasicStorageService;
    (agent as any).agentServicesProps = mockAgentServicesProps;

    mockAgentUrls = {
      url: "http://127.0.0.1:3901",
      bootUrl: "http://127.0.0.1:3903"
    };
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw an error if boot fails", async () => {
    (signifyReady as jest.Mock).mockResolvedValueOnce(true);
    mockSignifyClient.boot.mockRejectedValueOnce(new Error("Boot error"));

    await expect(agent.bootAndConnect(mockAgentUrls)).rejects.toThrowError(Agent.KERIA_BOOT_FAILED);
    expect(mockSignifyClient.connect).not.toHaveBeenCalled();
  });

  test("should throw an connection error if boot fetch failing", async () => {
    (signifyReady as jest.Mock).mockResolvedValueOnce(true);
    mockSignifyClient.boot.mockRejectedValueOnce(new Error("Failed to fetch"));

    await expect(agent.bootAndConnect(mockAgentUrls)).rejects.toThrowError(Agent.KERIA_BOOT_FAILED_BAD_NETWORK);
    expect(mockSignifyClient.connect).not.toHaveBeenCalled();
  });

  test("should throw an error if boot result is not ok and status is not 400", async () => {
    (signifyReady as jest.Mock).mockResolvedValueOnce(true);
    mockSignifyClient.boot.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(agent.bootAndConnect(mockAgentUrls)).rejects.toThrowError(Agent.KERIA_BOOT_FAILED);
    expect(mockSignifyClient.connect).not.toHaveBeenCalled();
  });

  test("should throw an connection error if connect fetch failing", async () => {
    (signifyReady as jest.Mock).mockResolvedValueOnce(true);
    mockSignifyClient.boot.mockResolvedValueOnce({ ok: true });
    mockSignifyClient.connect.mockRejectedValueOnce(new Error("Failed to fetch"));

    await expect(agent.bootAndConnect(mockAgentUrls)).rejects.toThrowError(Agent.KERIA_BOOT_FAILED_BAD_NETWORK);

    expect(mockSignifyClient.boot).toHaveBeenCalled();
    expect(mockSignifyClient.connect).toHaveBeenCalled();
  });

  test("should throw an error if connect fails after booting", async () => {
    (signifyReady as jest.Mock).mockResolvedValueOnce(true);
    mockSignifyClient.boot.mockResolvedValueOnce({ ok: true });
    mockSignifyClient.connect.mockRejectedValueOnce(new Error("Connect error"));

    await expect(agent.bootAndConnect(mockAgentUrls)).rejects.toThrowError(Agent.KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT);

    expect(mockSignifyClient.boot).toHaveBeenCalled();
    expect(mockSignifyClient.connect).toHaveBeenCalled();
  });

  test("should boot and connect successfully if agent offline", async () => {
    (signifyReady as jest.Mock).mockResolvedValueOnce(true);
    mockSignifyClient.boot.mockResolvedValueOnce({ ok: true });
    mockSignifyClient.connect.mockResolvedValueOnce(true);
    SecureStorage.get = jest.fn().mockResolvedValueOnce(mockGetBranValue);
    await agent.bootAndConnect(mockAgentUrls);

    expect(signifyReady).toHaveBeenCalled();
    expect(SignifyClient).toHaveBeenCalledWith(
      mockAgentUrls.url,
      mockGetBranValue,
      Tier.low,
      mockAgentUrls.bootUrl
    );
    expect(SecureStorage.get).toBeCalledWith(KeyStoreKeys.SIGNIFY_BRAN)
    expect(mockSignifyClient.boot).toHaveBeenCalled();
    expect(mockSignifyClient.connect).toHaveBeenCalled();
    expect(mockBasicStorageService.save).toBeCalledTimes(2)
    expect(Agent.isOnline).toBe(true);
    expect(mockAgentServicesProps.eventEmitter.emit).toBeCalledWith({
      type: EventTypes.KeriaStatusChanged,
      payload: {
        isOnline: true,
      },
    });
  });

  it("should not boot and connect if already online", async () => {
    Agent.isOnline = true;

    await agent.bootAndConnect(mockAgentUrls);

    expect(signifyReady).not.toHaveBeenCalled();
    expect(mockSignifyClient.boot).not.toHaveBeenCalled();
    expect(mockSignifyClient.connect).not.toHaveBeenCalled();
  });
});

describe("test cases of recoverKeriaAgent function", () => {
  let agent: Agent;
  let mockSeedPhrase: string[];
  let mockConnectUrl: string;
  let mockSignifyClient: any;

  beforeEach(() => {
    mockSignifyClient = {
      boot: jest.fn(),
      connect: jest.fn(),
    };
    (SignifyClient as jest.Mock).mockImplementation(() => mockSignifyClient);
    agent = Agent.agent;
    (agent as any).basicStorageService = mockBasicStorageService;
    (agent as any).agentServicesProps = mockAgentServicesProps;
    mockSeedPhrase = ['abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'abandon', 'about'];
    mockConnectUrl = "http://127.0.0.1:3901";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should recover the agent and connect successfully', async () => {
    mockSignifyClient.connect.mockResolvedValueOnce(undefined);
    SecureStorage.set = jest.fn().mockResolvedValueOnce(undefined);
    const branBuffer = Buffer.from(mockEntropy, "hex").slice(0, -Agent.BUFFER_ALLOC_SIZE);
    const expectedBran = branBuffer.toString("utf-8");
    (mnemonicToEntropy as jest.Mock).mockReturnValueOnce(mockEntropy);

    await agent.recoverKeriaAgent(mockSeedPhrase, mockConnectUrl);

    expect(SignifyClient).toHaveBeenCalledWith(mockConnectUrl, expectedBran, Tier.low);
    expect(mockSignifyClient.connect).toHaveBeenCalled();
    expect(SecureStorage.set).toHaveBeenCalledWith(KeyStoreKeys.SIGNIFY_BRAN, expectedBran);
    expect(Agent.isOnline).toBe(true);
    expect(mockAgentServicesProps.eventEmitter.emit).toBeCalledWith({
      type: EventTypes.KeriaStatusChanged,
      payload: {
        isOnline: true,
      },
    });
  });

  test('should throw an error for invalid mnemonic', async () => {
    (mnemonicToEntropy as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid mnemonic");
    });

    await expect(agent.recoverKeriaAgent(mockSeedPhrase, mockConnectUrl))
      .rejects.toThrowError(Agent.INVALID_MNEMONIC);

    expect(mockSignifyClient.connect).not.toHaveBeenCalled();
    expect(SecureStorage.set).not.toHaveBeenCalled();
  });

  test('should throw KERIA_NOT_BOOTED error if agent is not booted', async () => {
    (mnemonicToEntropy as jest.Mock).mockReturnValueOnce(mockEntropy);
    (mnemonicToEntropy as jest.Mock).mockReturnValueOnce(mockEntropy);
    mockSignifyClient.connect.mockRejectedValueOnce(new Error("agent does not exist for controller"));

    await expect(agent.recoverKeriaAgent(mockSeedPhrase, mockConnectUrl))
      .rejects.toThrowError(Agent.KERIA_NOT_BOOTED);

    expect(SecureStorage.set).not.toHaveBeenCalled();
  });

  test("should throw KERIA_BOOT_FAILED_BAD_NETWORK error if connect fetch failing", async () => {
    (mnemonicToEntropy as jest.Mock).mockReturnValueOnce(mockEntropy);
    (mnemonicToEntropy as jest.Mock).mockReturnValueOnce(mockEntropy);
    mockSignifyClient.connect.mockRejectedValueOnce(new Error("Failed to fetch"));

    await expect(agent.recoverKeriaAgent(mockSeedPhrase, mockConnectUrl))
      .rejects.toThrowError(Agent.KERIA_BOOT_FAILED_BAD_NETWORK);

    expect(SecureStorage.set).not.toHaveBeenCalled();
  });
});

