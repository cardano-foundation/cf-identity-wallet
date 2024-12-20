import { PeerConnection } from "../../cardano/walletConnect/peerConnection";
import { Agent } from "../agent";
import { ConnectionStatus } from "../agent.types";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { CoreEventEmitter } from "../event";
import { IdentifierService } from "./identifierService";
import { EventTypes } from "../event.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { IdentifierStorage } from "../records";

const listIdentifiersMock = jest.fn();
const getIdentifierMembersMock = jest.fn();
const getIdentifiersMock = jest.fn();
const updateIdentifierMock = jest.fn();
const createIdentifierMock = jest.fn();
const rotateIdentifierMock = jest.fn();
const saveOperationPendingMock = jest.fn();
const operationMock = jest.fn();
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
const getAgentConfigMock = jest.fn();

jest.mock("signify-ts", () => ({
  Salter: jest.fn().mockImplementation(() => {
    return { qb64: "" };
  }),
}));

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
    update: updateIdentifierMock,
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
  config: () => ({
    get: getAgentConfigMock,
  }),
});

const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
  getIdentifierMetadataByGroupId: jest.fn(),
  deleteIdentifierMetadata: jest.fn(),
  getIdentifiersPendingDeletion: jest.fn(),
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

const WITNESSES = [
  "http://witnesess:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller?role=witness",
  "http://witnesess:5643/oobi/BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM/controller?role=witness",
  "http://witnesess:5644/oobi/BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX/controller?role=witness",
  "http://witnesess:5645/oobi/BM35JN8XeJSEfpxopjn5jr7tAHCE5749f0OobhMLCorE/controller?role=witness",
  "http://witnesess:5646/oobi/BIj15u5V11bkbtAxMA7gcNJZcax-7TgaBMLsQnMHpYHP/controller?role=witness",
  "http://witnesess:5647/oobi/BF2rZTW79z4IXocYRQnjjsOuvFUQv-ptCf8Yltd7PfsM/controller?role=witness"
];
const witnessEids = WITNESSES.map((oobi: string) => oobi.split("/oobi/")[1].split("/")[0]);

describe("Single sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    getAgentConfigMock.mockResolvedValue({
      iurls: WITNESSES
    });
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
      members: undefined,
    });
  });

  test("group identifier detailed view should contain the member identifiers", async () => {
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
      isPending: false,
    });
    expect(createIdentifierMock).toBeCalledWith(`0:${displayName}`, {
      toad: WITNESSES.length,
      wits: witnessEids
    });
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
      isPending: true,
    });
    expect(createIdentifierMock).toBeCalledWith(`0:${displayName}`, {
      toad: WITNESSES.length,
      wits: witnessEids
    });
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
    expect(createIdentifierMock).not.toBeCalled();
  });

  test("cannot create identifier is agent config is missing", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getAgentConfigMock.mockResolvedValueOnce({});

    await expect(
      identifierService.createIdentifier({
        displayName: "newDisplayName",
        theme: 0,
      })
    ).rejects.toThrowError(IdentifierService.MISCONFIGURED_AGENT_CONFIGURATION);
    expect(createIdentifierMock).not.toBeCalled();
  });

  test("cannot create identifier is there are no discoverable witnesses", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getAgentConfigMock.mockResolvedValueOnce({
      iurls: ["http://witnesess:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller"]
    });

    await expect(
      identifierService.createIdentifier({
        displayName: "newDisplayName",
        theme: 0,
      })
    ).rejects.toThrowError(IdentifierService.NO_WITNESSES_AVAILABLE);
    expect(createIdentifierMock).not.toBeCalled();
  });

  test("should throw an error if identifier name already exists", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "newDisplayName";
    const theme = 0;
    const errorMessage =
      "HTTP POST /identifiers - 400 Bad Request - {'title': 'AID with name {theme}:{name} already incepted'}";
    createIdentifierMock.mockResolvedValue({
      serder: {
        ked: {
          i: "i",
        },
      },
      op: operationMock,
    });
    operationMock.mockRejectedValue(new Error(errorMessage));
    await expect(
      identifierService.createIdentifier({
        displayName,
        theme,
      })
    ).rejects.toThrowError(
      `${IdentifierService.IDENTIFIER_NAME_TAKEN}: ${theme}:${displayName}`
    );
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.spyOn(require("./utils"), "randomSalt").mockReturnValue("0ADQpus-mQmmO4mgWcT3ekDz");

    await identifierService.deleteIdentifier(identifierMetadataRecord.id);

    expect(connections.deleteConnectionById).toBeCalledWith("group-id");
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id,
      {
        isDeleted: true,
        pendingDeletion: false,
      }
    );
    expect(updateIdentifierMock).toBeCalledWith(identifierMetadataRecord.id, {
      name: `XX-0ADQpus-mQmmO4mgWcT3ekDz:${identifierMetadataRecord.displayName}`
    });
  });

  test("can update an identifier", async () => {
    const newDisplayName = "newDisplayName";
    const newTheme = 1;
    await identifierService.updateIdentifier(keriMetadataRecord.id, {
      displayName: newDisplayName,
      theme: newTheme,
    });
    expect(updateIdentifierMock).toBeCalledWith(keriMetadataRecord.id, {
      name: `${newTheme}:${newDisplayName}`,
    });
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id,
      {
        displayName: newDisplayName,
        theme: newTheme,
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.spyOn(require("./utils"), "randomSalt").mockReturnValue("0ADQpus-mQmmO4mgWcT3ekDz");

    await identifierService.deleteIdentifier(identifierMetadataRecord.id);

    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id,
      {
        isDeleted: true,
        pendingDeletion: false,
      }
    );
    expect(updateIdentifierMock).toBeCalledWith(identifierMetadataRecord.id, {
      name: `XX-0ADQpus-mQmmO4mgWcT3ekDz:${identifierMetadataRecord.displayName}`
    });
    expect(PeerConnection.peerConnection.disconnectDApp).toBeCalledWith(
      "dApp-address",
      true
    );
  });

  test("Should correctly sync KERI identifiers, handling both group and non-group cases", async () => {
    // Mock the online status of the agent
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
  
    // Mock the list of identifiers returned by signifyClient
    listIdentifiersMock.mockReturnValue({
      aids: [
        {
          name: "0:1-group1:test1",
          prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
        },
        {
          name: "15:test1",
          prefix: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
          group: {
            mhab: {
              name: "0:1-group1:test1",
              prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
            },
          },
        },
        {
          name: "33:test2",
          prefix: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
        },
      ],
    });
  
    // Mock the identifier storage
    identifierStorage.getKeriIdentifiersMetadata = jest.fn().mockReturnValue([]);
    identifierStorage.createIdentifierMetadataRecord = jest.fn();
    identifierStorage.updateIdentifierMetadata = jest.fn();
  
    // Mock the signifyClient operations call
    const mockOperation = {
      done: true,
      name: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
    };
    jest
      .spyOn(signifyClient.operations(), "get")
      .mockResolvedValue(mockOperation);
  
    // Call the function to test
    await identifierService.syncKeriaIdentifiers();
  
    // sync data of non-group record
    expect(identifierStorage.createIdentifierMetadataRecord).toHaveBeenCalledWith({
      id: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      displayName: "1-group1",
      theme: 0,
      groupMetadata: {
        groupId: "1-group1",
        groupCreated: false,
        groupInitiator: true,
      },
      isPending: false,
    });
  
    expect(identifierStorage.createIdentifierMetadataRecord).toHaveBeenCalledWith({
      id: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      displayName: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      theme: 33,
      isPending: false,
    });

    // sync data of group record
    expect(identifierStorage.updateIdentifierMetadata).toHaveBeenCalledWith(
      "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      {
        groupMetadata: {
          groupId: "1-group1",
          groupCreated: true,
          groupInitiator: true,
        },
      }
    );

    expect(identifierStorage.createIdentifierMetadataRecord).toHaveBeenCalledWith({
      id: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
      displayName: "1-group1",
      theme: 15,
      multisigManageAid: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      isPending: false,
    });
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

  test("Should mark identifier is pending when start delete identifier", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    eventEmitter.emit = jest.fn();

    await identifierService.markIdentifierPendingDelete(keriMetadataRecord.id);

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.IdentifierRemoved,
      payload: {
        id: keriMetadataRecord.id,
      },
    });
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id,
      {
        pendingDeletion: true,
      }
    );
  });

  test("Should not try to mark an identifier as pending delete if it does note exist", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);

    await expect(
      identifierService.markIdentifierPendingDelete(keriMetadataRecord.id)
    ).rejects.toThrow(new Error("Identifier metadata record does not exist"));
    expect(identifierStorage.updateIdentifierMetadata).not.toBeCalled();
  });

  test("Should retrieve pending deletions and delete each by ID", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierService.deleteIdentifier = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    identifierStorage.getIdentifiersPendingDeletion.mockResolvedValueOnce([
      { id: "id1" },
      { id: "id2" },
    ]);
    await identifierService.removeIdentifiersPendingDeletion();

    expect(identifierService.deleteIdentifier).toHaveBeenCalledWith("id1");
    expect(identifierService.deleteIdentifier).toHaveBeenCalledWith("id2");
  });
});
