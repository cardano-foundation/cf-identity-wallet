import { PeerConnection } from "../../cardano/walletConnect/peerConnection";
import { Agent } from "../agent";
import { ConnectionStatus, MiscRecordId } from "../agent.types";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { CoreEventEmitter } from "../event";
import { IdentifierService } from "./identifierService";
import { EventTypes } from "../event.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import * as utils from "./utils";
import { BasicRecord } from "../records";
import { StorageMessage } from "../../storage/storage.types";
import { CreationStatus } from "./identifier.types";

const listIdentifiersMock = jest.fn();
const getIdentifierMembersMock = jest.fn();
const getIdentifiersMock = jest.fn();
const updateIdentifierMock = jest.fn();
const createIdentifierMock = jest.fn();
const rotateIdentifierMock = jest.fn();
const saveOperationPendingMock = jest.fn();
const findOperationMock = jest.fn();
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
  getUserFacingIdentifierRecords: jest.fn(),
  getIdentifierRecords: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
  getIdentifierMetadataByGroupId: jest.fn(),
  deleteIdentifierMetadata: jest.fn(),
  getIdentifierPendingCreation: jest.fn(),
  getIdentifiersPendingDeletion: jest.fn(),
});

const operationPendingStorage = jest.mocked({
  save: saveOperationPendingMock,
  findById: findOperationMock,
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

const basicStorage = jest.mocked({
  findById: jest.fn(),
  save: jest.fn(),
  createOrUpdateBasicRecord: jest.fn(),
  update: jest.fn(),
  deleteById: jest.fn(),
});

const identifierService = new IdentifierService(
  agentServicesProps,
  identifierStorage as any,
  operationPendingStorage as any,
  connections as any,
  basicStorage as any
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
  creationStatus: CreationStatus.COMPLETE,
  groupMetadata,
  sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
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
  salty: {
    sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
  },
  icp_dt: "2024-12-30T16:49:05.800487+00:00",
};

const groupIdentifierStateKeria = {
  ...identifierStateKeria,
  group: {},
  salty: undefined,
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

eventEmitter.emit = jest.fn();

const WITNESSES = [
  "http://witnesess:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller?role=witness",
  "http://witnesess:5643/oobi/BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapM/controller?role=witness",
  "http://witnesess:5644/oobi/BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfX/controller?role=witness",
  "http://witnesess:5645/oobi/BM35JN8XeJSEfpxopjn5jr7tAHCE5749f0OobhMLCorE/controller?role=witness",
  "http://witnesess:5646/oobi/BIj15u5V11bkbtAxMA7gcNJZcax-7TgaBMLsQnMHpYHP/controller?role=witness",
  "http://witnesess:5647/oobi/BF2rZTW79z4IXocYRQnjjsOuvFUQv-ptCf8Yltd7PfsM/controller?role=witness",
  "http://witnesess:5648/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2HA/controller?role=witness",
  "http://witnesess:5649/oobi/BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapA/controller?role=witness",
  "http://witnesess:5650/oobi/BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfA/controller?role=witness",
  "http://witnesess:5651/oobi/BM35JN8XeJSEfpxopjn5jr7tAHCE5749f0OobhMLCorA/controller?role=witness",
  "http://witnesess:5652/oobi/BIj15u5V11bkbtAxMA7gcNJZcax-7TgaBMLsQnMHpYHA/controller?role=witness",
  "http://witnesess:5653/oobi/BF2rZTW79z4IXocYRQnjjsOuvFUQv-ptCf8Yltd7PfsB/controller?role=witness",
  "http://witnesess:5654/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2HB/controller?role=witness",
  "http://witnesess:5655/oobi/BLskRTInXnMxWaGqcpSyMgo0nYbalW99cGZESrz3zapB/controller?role=witness",
  "http://witnesess:5656/oobi/BIKKuvBwpmDVA4Ds-EpL5bt9OqPzWPja2LigFYZN2YfB/controller?role=witness",
  "http://witnesess:5657/oobi/BM35JN8XeJSEfpxopjn5jr7tAHCE5749f0OobhMLCorB/controller?role=witness",
  "http://witnesess:5658/oobi/BIj15u5V11bkbtAxMA7gcNJZcax-7TgaBMLsQnMHpYHB/controller?role=witness",
  "http://witnesess:5659/oobi/BF2rZTW79z4IXocYRQnjjsOuvFUQv-ptCf8Yltd7PfsB/controller?role=witness",
];
const witnessEids = WITNESSES.map(
  (oobi: string) => oobi.split("/oobi/")[1].split("/")[0]
);

describe("Single sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    getAgentConfigMock.mockResolvedValue({
      iurls: WITNESSES.slice(0, 6),
    });
  });

  test("can get all user facing identifiers", async () => {
    identifierStorage.getUserFacingIdentifierRecords = jest
      .fn()
      .mockResolvedValue([keriMetadataRecord]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        createdAtUTC: nowISO,
        theme: 0,
        creationStatus: CreationStatus.COMPLETE,
        groupMetadata,
      },
    ]);
  });

  test("can get all identifier records, even non user facing", async () => {
    identifierStorage.getIdentifierRecords = jest
      .fn()
      .mockResolvedValue([keriMetadataRecord]);
    expect(await identifierService.getIdentifiers(false)).toStrictEqual([
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        createdAtUTC: nowISO,
        theme: 0,
        creationStatus: CreationStatus.COMPLETE,
        groupMetadata,
      },
    ]);
  });

  test("can get all identifiers without error if there are none", async () => {
    identifierStorage.getUserFacingIdentifierRecords = jest
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
    ).rejects.toMatchObject(
      new Error(`${Agent.MISSING_DATA_ON_KERIA}: ${keriMetadataRecord.id}`, {
        cause: "request - 404 - SignifyClient message",
      })
    );
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
  });

  test("cannot get identifier if it's still pending", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...keriMetadataRecord,
      creationStatus: CreationStatus.PENDING,
    });
    await expect(
      identifierService.getIdentifier(keriMetadataRecord.id)
    ).rejects.toThrow(new Error(IdentifierService.IDENTIFIER_NOT_COMPLETE));
  });

  test("cannot get identifier if it failed", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...keriMetadataRecord,
      creationStatus: CreationStatus.FAILED,
    });
    await expect(
      identifierService.getIdentifier(keriMetadataRecord.id)
    ).rejects.toThrow(new Error(IdentifierService.IDENTIFIER_NOT_COMPLETE));
  });

  test("can get an identifier in detailed view", async () => {
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
      creationStatus: CreationStatus.COMPLETE,
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
      creationStatus: CreationStatus.COMPLETE,
      members: [
        identifierMembersState.signing[0].aid,
        identifierMembersState.signing[1].aid,
      ],
    });
  });

  test("cannot create an identifier if theme is not valid", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);

    await expect(
      identifierService.createIdentifier({
        displayName: "newDisplayName",
        theme: 44,
      })
    ).rejects.toThrowError(IdentifierService.INVALID_THEME);

    expect(createIdentifierMock).not.toBeCalled();
  });

  test("should throw an error if queued is not an array when creating identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const newTheme = 1;
    basicStorage.findById.mockResolvedValueOnce(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: "invalidFormat",
        },
      })
    );

    await expect(
      identifierService.createIdentifier({
        displayName: "displayName",
        theme: newTheme,
      })
    ).rejects.toThrowError(
      IdentifierService.INVALID_QUEUED_DISPLAY_NAMES_FORMAT
    );

    expect(basicStorage.findById).toHaveBeenCalledWith(
      MiscRecordId.IDENTIFIERS_PENDING_CREATION
    );
  });

  test("can create an identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "displayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockResolvedValue({
      serder: {
        ked: {
          i: "id",
        },
      },
      op: jest.fn().mockResolvedValue({
        name: "op123",
        done: false,
      }),
    });
    basicStorage.findById = jest
      .fn()
      .mockResolvedValueOnce(
        new BasicRecord({
          id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
          content: {
            queued: [],
          },
        })
      )
      .mockResolvedValueOnce(
        new BasicRecord({
          id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
          content: {
            queued: ["0:displayName"],
          },
        })
      );
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "op123",
      recordType: OperationPendingRecordType.Witness,
    });

    await identifierService.createIdentifier({
      displayName,
      theme: 0,
    });

    expect(basicStorage.createOrUpdateBasicRecord).toBeCalledWith(
      expect.objectContaining({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: { queued: ["0:displayName"] },
      })
    );
    expect(createIdentifierMock).toBeCalledWith("0:displayName", {
      toad: 4,
      wits: witnessEids.slice(0, 6),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        displayName,
        id: "id",
        creationStatus: CreationStatus.PENDING,
        theme: 0,
        sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
      })
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.IdentifierAdded,
      payload: {
        identifier: {
          id: "id",
          displayName,
          createdAtUTC: "2024-12-30T16:49:05.800Z",
          creationStatus: CreationStatus.PENDING,
          theme: 0,
        },
      },
    });
    expect(basicStorage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: { queued: [] },
      })
    );
  });

  test("can retry creating an identifier (skip storing name)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "displayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockResolvedValue({
      serder: {
        ked: {
          i: "id",
        },
      },
      op: jest.fn().mockResolvedValue({
        name: "op123",
        done: false,
      }),
    });
    basicStorage.findById = jest.fn().mockResolvedValue(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: ["0:X", "0:displayName", "1:Y", "2:Z"],
        },
      })
    );
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "op123",
      recordType: OperationPendingRecordType.Witness,
    });

    await identifierService.createIdentifier(
      {
        displayName,
        theme: 0,
      },
      true
    );

    expect(basicStorage.createOrUpdateBasicRecord).not.toBeCalled();
    expect(createIdentifierMock).toBeCalledWith("0:displayName", {
      toad: 4,
      wits: witnessEids.slice(0, 6),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        displayName,
        id: "id",
        creationStatus: CreationStatus.PENDING,
        theme: 0,
      })
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.IdentifierAdded,
      payload: {
        identifier: {
          id: "id",
          displayName,
          createdAtUTC: "2024-12-30T16:49:05.800Z",
          creationStatus: CreationStatus.PENDING,
          theme: 0,
        },
      },
    });
    expect(basicStorage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: { queued: ["0:X", "1:Y", "2:Z"] },
      })
    );
  });

  test("can continue to create identifier if already exists on the cloud", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "displayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockRejectedValue(
      new Error("request - 400 - already incepted")
    );
    basicStorage.findById = jest.fn().mockResolvedValue(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: ["0:displayName"],
        },
      })
    );
    listIdentifiersMock
      .mockResolvedValueOnce({
        aids: [{ prefix: "differentId", name: "0:a-different-name" }],
      })
      .mockResolvedValueOnce({
        aids: [{ prefix: "id", name: "0:displayName" }],
      });
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "op123",
      recordType: OperationPendingRecordType.Witness,
    });

    await identifierService.createIdentifier(
      {
        displayName,
        theme: 0,
      },
      true
    );

    expect(basicStorage.createOrUpdateBasicRecord).not.toBeCalled();
    expect(createIdentifierMock).toBeCalledWith("0:displayName", {
      toad: 4,
      wits: witnessEids.slice(0, 6),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        displayName,
        id: "id",
        creationStatus: CreationStatus.PENDING,
        theme: 0,
      })
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.IdentifierAdded,
      payload: {
        identifier: {
          id: "id",
          displayName,
          createdAtUTC: "2024-12-30T16:49:05.800Z",
          creationStatus: CreationStatus.PENDING,
          theme: 0,
        },
      },
    });
    expect(basicStorage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: { queued: [] },
      })
    );
  });

  test("should error if display name is conflicting but cannot find by name thereafter", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "displayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockRejectedValue(
      new Error("request - 400 - already incepted")
    );
    basicStorage.findById = jest.fn().mockResolvedValue(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: ["0:displayName"],
        },
      })
    );
    listIdentifiersMock
      .mockResolvedValueOnce({
        aids: [{ prefix: "different-id", name: "0:different-displayName" }],
      })
      .mockResolvedValueOnce({
        aids: [],
      });
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "op123",
      recordType: OperationPendingRecordType.Witness,
    });

    await expect(
      identifierService.createIdentifier(
        {
          displayName,
          theme: 0,
        },
        true
      )
    ).rejects.toThrowError(
      IdentifierService.CANNOT_FIND_EXISTING_IDENTIFIER_BY_SEARCH
    );

    expect(basicStorage.createOrUpdateBasicRecord).not.toBeCalled();
    expect(createIdentifierMock).toBeCalledWith("0:displayName", {
      toad: 4,
      wits: witnessEids.slice(0, 6),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).not.toBeCalled();
    expect(eventEmitter.emit).not.toBeCalled();
    expect(basicStorage.update).not.toBeCalled();
  });

  test("should continue to track operations if metadata record already exists when creating identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "displayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockResolvedValue({
      serder: {
        ked: {
          i: "id",
        },
      },
      op: jest.fn().mockResolvedValue({
        name: "op123",
        done: false,
      }),
    });
    basicStorage.findById = jest.fn().mockResolvedValue(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: ["0:X", "0:displayName", "1:Y", "2:Z"],
        },
      })
    );
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "op123",
      recordType: OperationPendingRecordType.Witness,
    });
    identifierStorage.createIdentifierMetadataRecord = jest
      .fn()
      .mockRejectedValue(
        new Error(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG)
      );

    await identifierService.createIdentifier(
      {
        displayName,
        theme: 0,
      },
      true
    );

    expect(basicStorage.createOrUpdateBasicRecord).not.toBeCalled();
    expect(createIdentifierMock).toBeCalledWith("0:displayName", {
      toad: 4,
      wits: witnessEids.slice(0, 6),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        displayName,
        id: "id",
        creationStatus: CreationStatus.PENDING,
        theme: 0,
      })
    );
    expect(eventEmitter.emit).not.toBeCalled();
    expect(basicStorage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: { queued: ["0:X", "1:Y", "2:Z"] },
      })
    );
  });

  test("should remove pending identifier name if all actions complete and duplicated", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const displayName = "displayName";
    eventEmitter.emit = jest.fn();
    createIdentifierMock.mockResolvedValue({
      serder: {
        ked: {
          i: "id",
        },
      },
      op: jest.fn().mockResolvedValue({
        name: "op123",
        done: false,
      }),
    });
    basicStorage.findById = jest.fn().mockResolvedValue(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: ["0:X", "0:displayName", "1:Y", "2:Z"],
        },
      })
    );
    getIdentifiersMock.mockResolvedValue(identifierStateKeria);
    identifierStorage.createIdentifierMetadataRecord = jest
      .fn()
      .mockRejectedValue(
        new Error(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG)
      );

    await identifierService.createIdentifier(
      {
        displayName,
        theme: 0,
      },
      true
    );

    expect(basicStorage.createOrUpdateBasicRecord).not.toBeCalled();
    expect(createIdentifierMock).toBeCalledWith("0:displayName", {
      toad: 4,
      wits: witnessEids.slice(0, 6),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        displayName,
        id: "id",
        creationStatus: CreationStatus.PENDING,
        theme: 0,
      })
    );
    expect(eventEmitter.emit).not.toBeCalled();
    expect(basicStorage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: { queued: ["0:X", "1:Y", "2:Z"] },
      })
    );
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
      iurls: [
        "http://witnesess:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller",
      ],
    });

    await expect(
      identifierService.createIdentifier({
        displayName: "newDisplayName",
        theme: 0,
      })
    ).rejects.toThrowError(IdentifierService.INSUFFICIENT_WITNESSES_AVAILABLE);

    expect(createIdentifierMock).not.toBeCalled();
  });

  test("should delete all associated linked connections if the identifier is a group member identifier", async () => {
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...keriMetadataRecord,
      creationStatus: CreationStatus.PENDING,
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
    const localMember = {
      id: "aidLocalMember",
      displayName: "Identifier Local",
      createdAt: now,
      theme: 0,
      groupMetadata,
      creationStatus: CreationStatus.PENDING,
      multisigManageAid: "manageAid",
    };
    identifierStorage.getIdentifierMetadata
      .mockReturnValueOnce({
        ...keriMetadataRecord,
        creationStatus: CreationStatus.PENDING,
        multisigManageAid: "manageAid",
        groupMetadata: undefined,
      })
      .mockReturnValueOnce(localMember);
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
    jest
      .spyOn(utils, "randomSalt")
      .mockReturnValueOnce("QOP7zdP-kJs8nlwVR290XfyAk")
      .mockReturnValueOnce("0ADQpus-mQmmO4mgWcT3ekDz");

    await identifierService.deleteIdentifier(identifierMetadataRecord.id);

    expect(connections.deleteConnectionById).toBeCalledWith("group-id");
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      identifierMetadataRecord.id,
      {
        isDeleted: true,
        pendingDeletion: false,
      }
    );
    expect(updateIdentifierMock).toBeCalledWith(localMember.id, {
      name: `XX-QOP7zdP-kJs8nlwVR290XfyAk:${localMember.groupMetadata.groupId}:${localMember.displayName}`,
    });
    expect(updateIdentifierMock).toBeCalledWith(identifierMetadataRecord.id, {
      name: `XX-0ADQpus-mQmmO4mgWcT3ekDz:${identifierMetadataRecord.displayName}`,
    });
    expect(updateIdentifierMock).toBeCalledTimes(2);
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
    jest.spyOn(utils, "randomSalt").mockReturnValue("0ADQpus-mQmmO4mgWcT3ekDz");

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
      name: `XX-0ADQpus-mQmmO4mgWcT3ekDz:${identifierMetadataRecord.displayName}`,
    });
    expect(PeerConnection.peerConnection.disconnectDApp).toBeCalledWith(
      "dApp-address",
      true
    );
  });

  test("Should correctly sync identifiers, handling both group and non-group cases", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    listIdentifiersMock
      .mockReturnValueOnce({
        aids: [
          {
            name: "0:1-group1:test1",
            prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
            sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
          },
          {
            name: "15:test1",
            prefix: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
            group: {
              mhab: {
                name: "0:1-group1:test1",
                prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
                sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
              },
            },
          },
          {
            name: "33:test2",
            prefix: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
            sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
          },
        ],
      })
      .mockReturnValue({ aids: [] });
    identifierStorage.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    identifierStorage.createIdentifierMetadataRecord = jest.fn();
    identifierStorage.updateIdentifierMetadata = jest.fn();
    jest
      .spyOn(signifyClient.operations(), "get")
      .mockResolvedValueOnce({
        done: true,
        name: "witness.EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      })
      .mockResolvedValueOnce({
        done: true,
        name: "witness.EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      })
      .mockResolvedValueOnce({
        done: true,
        name: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
      });
    getIdentifiersMock
      .mockResolvedValueOnce({
        salty: {
          sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
        },
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      })
      .mockResolvedValueOnce({
        salty: {
          sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
        },
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      })
      .mockResolvedValueOnce({
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      });

    await identifierService.syncKeriaIdentifiers();

    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      displayName: "1-group1",
      theme: 0,
      groupMetadata: {
        groupId: "1-group1",
        groupCreated: false,
        groupInitiator: true,
      },
      creationStatus: CreationStatus.COMPLETE,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
      sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
    });
    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      displayName: "test2",
      theme: 33,
      creationStatus: CreationStatus.COMPLETE,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
      sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
    });
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
    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
      displayName: "1-group1",
      theme: 15,
      multisigManageAid: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      creationStatus: CreationStatus.COMPLETE,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
    });
    expect(operationPendingStorage.save).not.toBeCalled();
    expect(eventEmitter.emit).not.toBeCalled();
  });

  test("Should add operation record for pending group and non-group identifiers", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    listIdentifiersMock
      .mockReturnValueOnce({
        aids: [
          {
            name: "0:1-group1:test1",
            prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
            sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
          },
          {
            name: "15:test1",
            prefix: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
            group: {
              mhab: {
                name: "0:1-group1:test1",
                prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
                sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
              },
            },
          },
          {
            name: "33:test2",
            prefix: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
            sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
          },
        ],
      })
      .mockReturnValue({ aids: [] });
    identifierStorage.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    identifierStorage.createIdentifierMetadataRecord = jest.fn();
    identifierStorage.updateIdentifierMetadata = jest.fn();
    jest
      .spyOn(signifyClient.operations(), "get")
      .mockResolvedValueOnce({
        done: false,
        name: "witness.EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      })
      .mockResolvedValueOnce({
        done: false,
        name: "witness.EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      })
      .mockResolvedValueOnce({
        done: false,
        name: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
      });
    getIdentifiersMock
      .mockResolvedValueOnce({
        salty: {
          sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
        },
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      })
      .mockResolvedValueOnce({
        salty: {
          sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
        },
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      })
      .mockResolvedValueOnce({
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      });
    saveOperationPendingMock
      .mockResolvedValueOnce({
        id: "witness.EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
        recordType: OperationPendingRecordType.Witness,
      })
      .mockResolvedValueOnce({
        id: "witness.EL-EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
        recordType: OperationPendingRecordType.Witness,
      })
      .mockResolvedValueOnce({
        id: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
        recordType: OperationPendingRecordType.Group,
      });

    await identifierService.syncKeriaIdentifiers();

    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      displayName: "1-group1",
      theme: 0,
      groupMetadata: {
        groupId: "1-group1",
        groupCreated: false,
        groupInitiator: true,
      },
      creationStatus: CreationStatus.PENDING,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
      sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
    });
    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      displayName: "test2",
      theme: 33,
      creationStatus: CreationStatus.PENDING,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
      sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
    });
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
    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
      displayName: "1-group1",
      theme: 15,
      multisigManageAid: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      creationStatus: CreationStatus.PENDING,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      recordType: OperationPendingRecordType.Witness,
      id: "witness.EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      recordType: OperationPendingRecordType.Witness,
      id: "witness.EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      recordType: OperationPendingRecordType.Group,
      id: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
    });
  });

  test("Should add operation record for failed group and non-group identifiers", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    listIdentifiersMock
      .mockReturnValueOnce({
        aids: [
          {
            name: "0:1-group1:test1",
            prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
            sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
          },
          {
            name: "15:test1",
            prefix: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
            group: {
              mhab: {
                name: "0:1-group1:test1",
                prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
                sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
              },
            },
          },
          {
            name: "33:test2",
            prefix: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
            sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
          },
        ],
      })
      .mockReturnValue({ aids: [] });
    identifierStorage.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    identifierStorage.createIdentifierMetadataRecord = jest.fn();
    identifierStorage.updateIdentifierMetadata = jest.fn();
    jest
      .spyOn(signifyClient.operations(), "get")
      .mockResolvedValueOnce({
        done: true,
        name: "witness.EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
        error: { code: 400 },
      })
      .mockResolvedValueOnce({
        done: true,
        name: "witness.EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
        error: { code: 400 },
      })
      .mockResolvedValueOnce({
        done: true,
        name: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
        error: { code: 400 },
      });
    getIdentifiersMock
      .mockResolvedValueOnce({
        salty: {
          sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
        },
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      })
      .mockResolvedValueOnce({
        salty: {
          sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
        },
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      })
      .mockResolvedValueOnce({
        icp_dt: "2024-12-10T07:28:18.217384+00:00",
      });
    saveOperationPendingMock
      .mockResolvedValueOnce({
        id: "witness.EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
        recordType: OperationPendingRecordType.Witness,
      })
      .mockResolvedValueOnce({
        id: "witness.EL-EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
        recordType: OperationPendingRecordType.Witness,
      })
      .mockResolvedValueOnce({
        id: "group.EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
        recordType: OperationPendingRecordType.Group,
      });

    await identifierService.syncKeriaIdentifiers();

    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      displayName: "1-group1",
      theme: 0,
      groupMetadata: {
        groupId: "1-group1",
        groupCreated: false,
        groupInitiator: true,
      },
      creationStatus: CreationStatus.FAILED,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
      sxlt: "1AAHFlFbNZ29MWHve6gyXfaJr4q2xgCmNEadpkh7IPuP1weDcOEb-bv3CmOoXK3xIik85tc9AYlNxFn_sTMpcvlbog8k4T5rE35i",
    });
    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EJ9oenRW3_SNc0JkETnOegspNGaDCypBfTU1kJiL2AMs",
      displayName: "test2",
      theme: 33,
      creationStatus: CreationStatus.FAILED,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
      sxlt: "1AAHOxnWacQOKjjcVD3Fl1PNyd9MDOkWAjpIfStG297qrCx9E2W5D8St0SdJ1E8N8yeaN0Gy4kLhH6PVHQwlupAGNRKvodlX-UKo",
    });
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
    expect(
      identifierStorage.createIdentifierMetadataRecord
    ).toHaveBeenCalledWith({
      id: "EPMFON5GHY3o4mLr7XsHvXBCED4gkr1ILUX9NSRkOPM",
      displayName: "1-group1",
      theme: 15,
      multisigManageAid: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
      creationStatus: CreationStatus.FAILED,
      createdAt: new Date("2024-12-10T07:28:18.217384+00:00"),
    });
    expect(operationPendingStorage.save).not.toBeCalled();
    expect(eventEmitter.emit).not.toBeCalled();
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

  test("should processs any identifiers pending creation", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    basicStorage.findById.mockResolvedValueOnce(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: ["0:newDisplayName"],
        },
      })
    );
    identifierService.createIdentifier = jest.fn();

    await identifierService.processIdentifiersPendingCreation();

    expect(identifierService.createIdentifier).toHaveBeenCalledWith(
      {
        theme: 0,
        displayName: "newDisplayName",
      },
      true
    );
  });

  test("should throw error if queued identifiers has invalid format", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    basicStorage.findById.mockResolvedValueOnce(
      new BasicRecord({
        id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
        content: {
          queued: "0:invalidFormat",
        },
      })
    );

    await expect(
      identifierService.processIdentifiersPendingCreation()
    ).rejects.toThrowError(
      IdentifierService.INVALID_QUEUED_DISPLAY_NAMES_FORMAT
    );
  });

  test("should gracefully exit if no pending identifiers", async () => {
    basicStorage.findById.mockResolvedValueOnce(null);
    await identifierService.processIdentifiersPendingCreation();

    expect(basicStorage.findById).toHaveBeenCalledWith(
      MiscRecordId.IDENTIFIERS_PENDING_CREATION
    );
    expect(identifierService.createIdentifier).not.toHaveBeenCalled();
  });

  test("cannot get available witnesses list if the config is misconfigured", async () => {
    getAgentConfigMock.mockResolvedValueOnce({});

    await expect(
      identifierService.getAvailableWitnesses()
    ).rejects.toThrowError(IdentifierService.MISCONFIGURED_AGENT_CONFIGURATION);
    expect(getAgentConfigMock).toBeCalled();
  });

  test("can get available witnesses list", async () => {
    getAgentConfigMock.mockResolvedValueOnce({
      iurls: [
        "http://witnesess:5642/oobi/BBilc4-L3tFUnfM_wJr4S4OJanAv_VmF_dJNN6vkf2Ha/controller",
        ...WITNESSES.slice(0, 6),
      ],
    });

    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 4,
      witnesses: [...witnessEids.slice(0, 6)],
    });
    expect(getAgentConfigMock).toBeCalled();
  });

  test("available witness list must be at least 6", async () => {
    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 5),
    });

    await expect(
      identifierService.getAvailableWitnesses()
    ).rejects.toThrowError(IdentifierService.INSUFFICIENT_WITNESSES_AVAILABLE);
    expect(getAgentConfigMock).toBeCalled();
  });

  test("duplicate witnesses are ignored", async () => {
    getAgentConfigMock.mockResolvedValueOnce({
      iurls: [...WITNESSES.slice(0, 6), ...WITNESSES.slice(0, 6)],
    });

    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 4,
      witnesses: [...witnessEids.slice(0, 6)],
    });
    expect(getAgentConfigMock).toBeCalled();
  });

  test("different witness list sizes", async () => {
    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 7),
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 5,
      witnesses: [...witnessEids.slice(0, 7)],
    });

    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 8),
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 5,
      witnesses: [...witnessEids.slice(0, 7)],
    });

    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 9),
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 6,
      witnesses: [...witnessEids.slice(0, 9)],
    });

    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 10),
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 7,
      witnesses: [...witnessEids.slice(0, 10)],
    });

    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 11),
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 7,
      witnesses: [...witnessEids.slice(0, 10)],
    });

    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES.slice(0, 12),
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 8,
      witnesses: [...witnessEids.slice(0, 12)],
    });

    getAgentConfigMock.mockResolvedValueOnce({
      iurls: WITNESSES,
    });
    expect(await identifierService.getAvailableWitnesses()).toStrictEqual({
      toad: 8,
      witnesses: [...witnessEids.slice(0, 12)],
    });
  });
});
