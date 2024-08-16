import { PeerConnection } from "../../cardano/walletConnect/peerConnection";
import { Agent } from "../agent";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { EventService } from "./eventService";
import { IdentifierService } from "./identifierService";

const identifiersListMock = jest.fn();
const identifiersGetMock = jest.fn();
const identifiersCreateMock = jest.fn();
const identifiersRotateMock = jest.fn();
const mockSigner = {
  _code: "A",
  _size: -1,
  _raw: {},
  _verfer: {},
};
const managerMock = {
  get: () => {
    return {
      signers: [mockSigner],
    };
  },
};
const operationGetMock = jest.fn().mockImplementation((id: string) => {
  return {
    done: true,
    response: {
      i: id,
    },
  };
});

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: jest.fn().mockResolvedValue({ op: jest.fn() }),
    interact: jest.fn(),
    rotate: identifiersRotateMock,
    members: jest.fn(),
  }),
  operations: () => ({
    get: operationGetMock,
  }),
  oobis: () => ({
    get: jest.fn(),
    resolve: jest.fn().mockImplementation((name: string) => {
      return {
        done: true,
        response: {
          i: name,
        },
      };
    }),
  }),
  contacts: () => ({
    list: jest.fn(),
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
    delete: jest.fn(),
  }),
  notifications: () => ({
    list: jest.fn(),
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
  manager: undefined,
});
const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
  getIdentifierMetadataByGroupId: jest.fn(),
  deleteIdentifierMetadata: jest.fn(),
});

const operationPendingStorage = jest.mocked({
  save: jest.fn(),
});

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
};

const identifierService = new IdentifierService(
  agentServicesProps,
  identifierStorage as any,
  operationPendingStorage as any
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionShortDetailById: jest.fn(),
        getConnections: jest.fn(),
      },
      signifyNotifications: {
        addPendingOperationToQueue: jest.fn(),
      },
      getKeriaOnlineStatus: jest.fn(),
    },
  },
}));

jest.mock("../../cardano/walletConnect/peerConnection", () => ({
  PeerConnection: {
    peerConnection: {
      getConnectedDAppAddress: jest.fn(),
      getConnectingAid: jest.fn(),
      disconnectDApp: jest.fn(),
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();

const groupMetadata = {
  groupId: "group-id",
  groupInitiator: true,
  groupCreated: false,
};

const keriMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
  groupMetadata,
};
const archivedMetadataRecord = new IdentifierMetadataRecord({
  ...keriMetadataRecordProps,
  isArchived: true,
  theme: 0,
});

const keriMetadataRecord = new IdentifierMetadataRecord(
  keriMetadataRecordProps
);

const aidReturnedBySignify = {
  prefix: keriMetadataRecord.id,
  state: {
    s: "s",
    dt: "dt",
    kt: "kt",
    k: "k",
    nt: "nt",
    n: "n",
    bt: "bt",
    b: "b",
    di: "di",
  },
};

describe("Single sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test("can get all identifiers", async () => {
    identifierStorage.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([keriMetadataRecord]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        signifyName: "uuid-here",
        createdAtUTC: nowISO,
        theme: 0,
        isPending: false,
        groupMetadata,
      },
    ]);
  });

  test("can get all identifiers without error if there are none", async () => {
    identifierStorage.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([]);
  });

  test("identifier exists in the database but not on Signify", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifiersGetMock.mockRejectedValue(
      new Error("request - 404 - SignifyClient message")
    );
    await expect(
      identifierService.getIdentifier(keriMetadataRecord.id)
    ).rejects.toThrow(
      new Error(`${Agent.MISSING_DATA_ON_KERIA}: ${keriMetadataRecord.id}`)
    );
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
  });

  test("Should throw error if the identifier is pending", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...keriMetadataRecord,
      isPending: true,
      signifyOpName: "signifyOpName",
    });
    await expect(
      identifierService.getIdentifier(keriMetadataRecord.id)
    ).rejects.toThrow(new Error(IdentifierService.IDENTIFIER_IS_PENDING));
  });

  test("can get a keri identifier in detailed view", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    expect(
      await identifierService.getIdentifier(keriMetadataRecord.id)
    ).toStrictEqual({
      id: keriMetadataRecord.id,
      displayName: keriMetadataRecordProps.displayName,
      createdAtUTC: nowISO,
      theme: 0,
      groupMetadata: keriMetadataRecord.groupMetadata,
      ...aidReturnedBySignify.state,
      signifyOpName: undefined,
      signifyName: "uuid-here",
      isPending: false,
    });
  });

  test("can create a keri identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    identifiersCreateMock.mockResolvedValue({
      serder: {
        ked: {
          i: aid,
        },
      },
      op: jest.fn().mockResolvedValue({
        name: "op123",
        done: true,
      }),
    });
    expect(
      await identifierService.createIdentifier({
        displayName,
        theme: 0,
      })
    ).toEqual({
      identifier: aid,
      signifyName: expect.any(String),
      isPending: false,
    });
    expect(identifiersCreateMock).toBeCalled();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
  });

  test("can create a keri identifier with pending operation", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    identifiersCreateMock.mockResolvedValue({
      serder: {
        ked: {
          i: aid,
        },
      },
      op: jest.fn().mockResolvedValue({
        name: "op123",
        done: false,
      }),
    });
    operationGetMock.mockImplementation((id: string) => {
      return {
        done: false,
        response: {
          i: id,
        },
      };
    });
    expect(
      await identifierService.createIdentifier({
        displayName,
        theme: 0,
      })
    ).toEqual({
      identifier: aid,
      signifyName: expect.any(String),
      isPending: true,
    });
    expect(identifiersCreateMock).toBeCalled();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
    expect(operationPendingStorage.save).toBeCalledTimes(1);
  });

  test("cannot create a keri identifier if theme is not valid", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "newDisplayName";
    identifiersCreateMock.mockResolvedValue({
      serder: {
        ked: {
          i: "i",
        },
      },
      op: jest.fn(),
    });
    await expect(
      identifierService.createIdentifier({
        displayName,
        theme: 44,
      })
    ).rejects.toThrowError(IdentifierService.THEME_WAS_NOT_VALID);
  });

  // For archive/delete/restore tests
  test("can delete an archived identifier (identifier and metadata record)", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    PeerConnection.peerConnection.getConnectingIdentifier = jest
      .fn()
      .mockReturnValue({ id: archivedMetadataRecord.id, oobi: "oobi" });

    identifierStorage.updateIdentifierMetadata = jest.fn();
    await identifierService.deleteIdentifier(archivedMetadataRecord.id);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      {
        isDeleted: true,
      }
    );
  });

  test("can delete an archived identifier and disconnect DApp", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    identifierStorage.updateIdentifierMetadata = jest.fn();
    PeerConnection.peerConnection.getConnectedDAppAddress = jest
      .fn()
      .mockReturnValue("dApp-address");
    PeerConnection.peerConnection.getConnectingIdentifier = jest
      .fn()
      .mockReturnValue({ id: archivedMetadataRecord.id, oobi: "oobi" });
    await identifierService.deleteIdentifier(archivedMetadataRecord.id);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      {
        isDeleted: true,
      }
    );
    expect(PeerConnection.peerConnection.disconnectDApp).toBeCalledWith(
      "dApp-address",
      true
    );
  });

  test("cannot delete a non-archived credential", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifierStorage.updateIdentifierMetadata = jest.fn();
    await expect(
      identifierService.deleteIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).not.toBeCalled();
  });

  test("can restore an archived credential", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    identifierStorage.updateIdentifierMetadata = jest.fn();
    await identifierService.restoreIdentifier(archivedMetadataRecord.id);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      { isArchived: false }
    );
  });

  test("cannot restore a non-archived credential", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    await expect(
      identifierService.restoreIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).not.toBeCalled();
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI identifiers", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifiersListMock.mockReturnValue({
      aids: [
        {
          name: "12219bf2-613a-4d5f-8c5d-5d093e7035b3",
          prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
          salty: {
            sxlt: "1AAHb70F3mVAOPNTX3GTp3lsfmwCxqLXa4MKDY-bR4oDlW_Env9lEPyo92Qya_OGK0QDeGOjzmEgXnRixFOm8uoaqYcrAs38qmZg",
            pidx: 0,
            kidx: 0,
            stem: "signify:aid",
            tier: "low",
            dcode: "E",
            icodes: ["A"],
            ncodes: ["A"],
            transferable: true,
          },
        },
      ],
      start: 1,
      end: 2,
      total: 1,
    });
    identifierStorage.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    await identifierService.syncKeriaIdentifiers();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
  });

  test("should call signify.rotateIdentifier with correct params", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 0,
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata.mockResolvedValue(metadata);
    identifiersRotateMock.mockResolvedValue({
      op: jest.fn().mockResolvedValue({
        done: true,
      }),
    });
    await identifierService.rotateIdentifier(metadata.id);
    expect(identifiersRotateMock).toHaveBeenCalledWith(metadata.signifyName);
  });

  test("Can get KERI identifier by group id", async () => {
    identifierStorage.getIdentifierMetadataByGroupId = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    expect(
      await identifierService.getKeriIdentifierByGroupId(
        keriMetadataRecord.groupMetadata?.groupId as string
      )
    ).toStrictEqual({
      displayName: keriMetadataRecord.displayName,
      id: keriMetadataRecord.id,
      signifyName: keriMetadataRecord.signifyName,
      createdAtUTC: keriMetadataRecord.createdAt.toISOString(),
      theme: keriMetadataRecord.theme,
      isPending: keriMetadataRecord.isPending ?? false,
    });
    /**null result */
    identifierStorage.getIdentifierMetadataByGroupId = jest
      .fn()
      .mockResolvedValue(null);
    expect(
      await identifierService.getKeriIdentifierByGroupId(
        keriMetadataRecord.groupMetadata?.groupId as string
      )
    ).toStrictEqual(null);
  });

  test("Should throw error if we failed to obtain key manager when call getSigner", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    await expect(
      identifierService.getSigner(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.FAILED_TO_OBTAIN_KEY_MANAGER);
  });

  test("Can get signer", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    signifyClient.manager = managerMock as any;
    expect(
      await identifierService.getSigner(keriMetadataRecord.id)
    ).toStrictEqual(mockSigner);
  });

  test("getIdentifier should throw an error when KERIA is offline", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 0,
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata.mockResolvedValue(metadata);
    await expect(identifierService.getIdentifier("id")).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
    await expect(identifierService.syncKeriaIdentifiers()).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
    await expect(
      identifierService.getSigner("identifier")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      identifierService.createIdentifier({
        displayName: "name",
        theme: 0,
      })
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(identifierService.rotateIdentifier("id")).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
  });

  test("Can delete stale local identifier", async () => {
    const identifierId = "identifier-id";
    PeerConnection.peerConnection.getConnectedDAppAddress = jest
      .fn()
      .mockReturnValueOnce("")
      .mockReturnValueOnce("dapp-address");
    PeerConnection.peerConnection.getConnectingIdentifier = jest
      .fn()
      .mockResolvedValue({
        id: identifierId,
      });

    await identifierService.deleteStaleLocalIdentifier(identifierId);
    expect(identifierStorage.deleteIdentifierMetadata).toBeCalledWith(
      identifierId
    );

    await identifierService.deleteStaleLocalIdentifier(identifierId);
    expect(PeerConnection.peerConnection.disconnectDApp).toBeCalledTimes(1);
    expect(identifierStorage.deleteIdentifierMetadata).toBeCalledWith(
      identifierId
    );
  });
});
