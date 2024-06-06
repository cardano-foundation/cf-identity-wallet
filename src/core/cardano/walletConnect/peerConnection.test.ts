import { DataType, SecureStorage } from "@aparajita/capacitor-secure-storage";
import { IdentityWalletConnect } from "./identityWalletConnect";
import { Agent } from "../../agent/agent";
import {
  PeerConnectionMetadataRecord,
  PeerConnectionStorage,
} from "../../agent/records";
import { PeerConnection } from "./peerConnection";
import { KeyStoreKeys } from "../../storage";
require("fake-indexeddb/auto");

jest.mock("../../agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionShortDetailById: jest.fn(),
        getMultisigLinkedContacts: jest.fn(),
      },
      identifiers: {
        updateIdentifier: jest.fn(),
      },
      getKeriaOnlineStatus: jest.fn(),
      peerConnectionMetadataStorage: {
        createPeerConnectionMetadataRecord: jest.fn(),
        getPeerConnectionMetadata: jest.fn(),
      },
    },
  },
}));
const EXISTING_KEY = "keythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE: DataType = "valuethatexists";

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      if (key === EXISTING_KEY) {
        return EXISTING_VALUE;
      }
      return null;
    },
    set: jest.fn(),
  },
}));

describe("PeerConnection", () => {
  let peerConnection: PeerConnection;

  beforeEach(() => {
    peerConnection = PeerConnection.peerConnection;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new PeerConnection instance", () => {
    expect(peerConnection).toBeInstanceOf(PeerConnection);
  });

  it("should start a connection", async () => {
    jest.mock("./identityWalletConnect", () => {
      return {
        IdentityWalletConnect: jest.fn(),
      };
    });
    const selectedAid = "testAid";
    jest.spyOn(SecureStorage, "get").mockResolvedValue("seed");

    await peerConnection.start(selectedAid);

    expect(SecureStorage.get).toHaveBeenCalledWith(KeyStoreKeys.MEERKAT_SEED);
  });

  it("should connect with a DApp if there is not existing connection", async () => {
    const dAppIdentifier = "testDApp";
    Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata = jest
      .fn()
      .mockRejectedValue(
        new Error(PeerConnectionStorage.PEER_CONNECTION_METADATA_RECORD_MISSING)
      );
    const connectSpy = jest
      .spyOn(IdentityWalletConnect.prototype, "connect")
      .mockReturnValue("seed");

    await peerConnection.start("testAid");
    await peerConnection.connectWithDApp(dAppIdentifier);
    expect(
      Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata
    ).toHaveBeenCalledWith(dAppIdentifier);
    expect(
      Agent.agent.peerConnectionMetadataStorage
        .createPeerConnectionMetadataRecord
    ).toHaveBeenCalled();
    expect(connectSpy).toHaveBeenCalledWith(dAppIdentifier);
    expect(SecureStorage.set).toHaveBeenCalledWith(
      KeyStoreKeys.MEERKAT_SEED,
      "seed"
    );
  });

  it("should connect with a DApp if there is an existing connection", async () => {
    const dAppIdentifier = "testDApp";
    Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata = jest
      .fn()
      .mockResolvedValue({
        id: "id",
        name: "name",
        url: "url",
        selectedAid: "aid",
        iconB64: "icon",
      } as PeerConnectionMetadataRecord);
    const connectSpy = jest
      .spyOn(IdentityWalletConnect.prototype, "connect")
      .mockReturnValue("seed");

    await peerConnection.start("testAid");
    await peerConnection.connectWithDApp(dAppIdentifier);
    expect(
      Agent.agent.peerConnectionMetadataStorage.getPeerConnectionMetadata
    ).toHaveBeenCalledWith(dAppIdentifier);
    expect(
      Agent.agent.peerConnectionMetadataStorage
        .createPeerConnectionMetadataRecord
    ).not.toBeCalled();
    expect(connectSpy).toHaveBeenCalledWith(dAppIdentifier);
    expect(SecureStorage.set).toHaveBeenCalledWith(
      KeyStoreKeys.MEERKAT_SEED,
      "seed"
    );
  });

  it("should disconnect from a DApp", () => {
    const dAppIdentifier = "testDApp";
    const disconnectSpy = jest
      .spyOn(IdentityWalletConnect.prototype, "disconnect")
      .mockReturnValue();

    peerConnection.start("testAid");
    peerConnection.disconnectDApp(dAppIdentifier);
    expect(disconnectSpy).toHaveBeenCalledWith(dAppIdentifier);
  });

  it("should return the connected DApp address", () => {
    peerConnection.start("testAid");
    expect(peerConnection.getConnectedDAppAddress()).toBe("");
  });

  it("should return the connecting Aid", () => {
    peerConnection.start("testAid");
    expect(peerConnection.getConnectingAid()).toBe("testAid");
  });
});
