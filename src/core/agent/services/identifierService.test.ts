import { PeerConnection } from "../../cardano/walletConnect/peerConnection";
import { Agent } from "../agent";
import { ConnectionStatus } from "../agent.types";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { CoreEventEmitter } from "../event";
import { IdentifierService } from "./identifierService";
import { EventTypes } from "../event.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";

const listIdentifiersMock = jest.fn();
const getIdentifierMembersMock = jest.fn();
const getIdentifiersMock = jest.fn();
const createIdentifierMock = jest.fn();
const rotateIdentifierMock = jest.fn();
const saveOperationPendingMock = jest.fn();
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
    list: listIdentifiersMock,
    get: getIdentifiersMock,
    create: createIdentifierMock,
    addEndRole: jest.fn().mockResolvedValue({ op: jest.fn() }),
    interact: jest.fn(),
    rotate: rotateIdentifierMock,
    members: getIdentifierMembersMock,
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
  save: saveOperationPendingMock,
});

const eventEmitter = new CoreEventEmitter();
const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter,
};

const connections = jest.mocked({
  getMultisigLinkedContacts: jest.fn(),
  deleteConnectionById: jest.fn(),
});

const identifierService = new IdentifierService(
  agentServicesProps,
  identifierStorage as any,
  operationPendingStorage as any,
  connections as any
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionShortDetailById: jest.fn(),
        getConnections: jest.fn(),
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

const identifierMetadataRecord = new IdentifierMetadataRecord({
  ...keriMetadataRecordProps,
  theme: 0,
});

const keriMetadataRecord = new IdentifierMetadataRecord(
  keriMetadataRecordProps
);

const identifierStateKeria = {
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

const groupIdentifierStateKeria = {
  ...identifierStateKeria,
  group: {},
};

const identifierMembersState = {
  signing: [
    {
      aid: "EGn8b8d9nUbmw3csQ7DO4mkfCz9HusIKL98xe1BFYOKb",
      ends: {},
    },
    {
      aid: "EH51ZBTNCY7acERZQ9u2PHMdswKMfW6KRHgKrYr0UMFg",
      ends: {},
    },
  ],
  rotation: [
    {
      aid: "EGn8b8d9nUbmw3csQ7DO4mkfCz9HusIKL98xe1BFYOKb",
      ends: {},
    },
    {
      aid: "EH51ZBTNCY7acERZQ9u2PHMdswKMfW6KRHgKrYr0UMFg",
      ends: {},
    },
  ],
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
    getIdentifiersMock.mockRejectedValue(
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
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    expect(
      await identifierService.getIdentifier(keriMetadataRecord.id)
    ).toStrictEqual({
      id: keriMetadataRecord.id,
      displayName: keriMetadataRecordProps.displayName,
      createdAtUTC: nowISO,
      theme: 0,
      groupMetadata: keriMetadataRecord.groupMetadata,
      multisigManageAid: keriMetadataRecord.multisigManageAid,
      ...identifierStateKeria.state,
      isPending: false,
    });
  });

  test.only("group identifier detailed view should contain the member identifiers", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    getIdentifiersMock.mockResolvedValue(groupIdentifierStateKeria);
    getIdentifierMembersMock.mockResolvedValue(identifierMembersState);
    expect(
      await identifierService.getIdentifier(keriMetadataRecord.id)
    ).toStrictEqual({
      id: keriMetadataRecord.id,
      displayName: keriMetadataRecordProps.displayName,
      createdAtUTC: nowISO,
      theme: 0,
      groupMetadata: keriMetadataRecord.groupMetadata,
      multisigManageAid: keriMetadataRecord.multisigManageAid,
      ...identifierStateKeria.state,
      isPending: false,
      members: [
        identifierMembersState.signing[0].aid,
        identifierMembersState.signing[1].aid,
      ],
    });
  });

  test("can create a keri identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    createIdentifierMock.mockResolvedValue({
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
    expect(createIdentifierMock).toBeCalled();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
  });

  test("can create a keri identifier with pending operation", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockResolvedValue({
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
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "op123",
      recordType: OperationPendingRecordType.Witness,
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
    expect(createIdentifierMock).toBeCalled();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "op123",
          recordType: OperationPendingRecordType.Witness,
        },
      },
    });
  });

  test("cannot create a keri identifier if theme is not valid", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "newDisplayName";
    createIdentifierMock.mockResolvedValue({
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

  test("should delete all associated linked connections if the identifier is a group member identifier", async () => {
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...keriMetadataRecord,
      isPending: true,
    });
    connections.getMultisigLinkedContacts = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
      },
    ]);
    PeerConnection.peerConnection.getConnectingIdentifier = jest
      .fn()
      .mockReturnValue({ id: identifierMetadataRecord.id, oobi: "oobi" });
    await identifierService.deleteIdentifier(identifierMetadataRecord.id);
    expect(connections.deleteConnectionById).toBeCalledWith(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
  });

  test("should delete the local member identifier for that multisig if deleting the multi-sig identifier", async () => {
    identifierStorage.getIdentifierMetadata
      .mockReturnValueOnce({
        ...keriMetadataRecord,
        isPending: true,
        multisigManageAid: "manageAid",
        groupMetadata: undefined,
      })
      .mockReturnValueOnce({
        ...keriMetadataRecord,
        isPending: true,
        multisigManageAid: "manageAid",
      });

    connections.getMultisigLinkedContacts = jest.fn().mockResolvedValue([
      {
        id: "group-id",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.CONFIRMED,
      },
    ]);

    identifierStorage.updateIdentifierMetadata = jest.fn();

    PeerConnection.peerConnection.getConnectingIdentifier = jest
      .fn()
      .mockReturnValue({ id: identifierMetadataRecord.id, oobi: "oobi" });
    await identifierService.deleteIdentifier(identifierMetadataRecord.id);
    expect(connections.deleteConnectionById).toBeCalledWith("group-id");
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id,
      {
        isDeleted: true,
      }
    );
  });

  test("can delete an identifier and disconnect DApp", async () => {
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...identifierMetadataRecord,
      groupMetadata: undefined,
    });
    identifierStorage.updateIdentifierMetadata = jest.fn();
    PeerConnection.peerConnection.getConnectedDAppAddress = jest
      .fn()
      .mockReturnValue("dApp-address");
    PeerConnection.peerConnection.getConnectingIdentifier = jest
      .fn()
      .mockReturnValue({ id: identifierMetadataRecord.id, oobi: "oobi" });
    await identifierService.deleteIdentifier(identifierMetadataRecord.id);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id,
      {
        isDeleted: true,
      }
    );
    expect(PeerConnection.peerConnection.disconnectDApp).toBeCalledWith(
      "dApp-address",
      true
    );
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI identifiers", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    listIdentifiersMock.mockReturnValue({
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
    const identifierId = "identifierId";
    rotateIdentifierMock.mockResolvedValue({
      op: jest.fn().mockResolvedValue({
        done: true,
      }),
    });
    await identifierService.rotateIdentifier(identifierId);
    expect(rotateIdentifierMock).toHaveBeenCalledWith(identifierId);
  });

  test("Should throw error if we failed to obtain key manager when call getSigner", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    await expect(
      identifierService.getSigner(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.FAILED_TO_OBTAIN_KEY_MANAGER);
  });

  test("Can get signer", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    signifyClient.manager = managerMock as any;
    expect(
      await identifierService.getSigner(keriMetadataRecord.id)
    ).toStrictEqual(mockSigner);
  });

  test("getIdentifier should throw an error when KERIA is offline", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    await expect(identifierService.getIdentifier("id")).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
    await expect(identifierService.syncKeriaIdentifiers()).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
    await expect(identifierService.getSigner("id")).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
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
