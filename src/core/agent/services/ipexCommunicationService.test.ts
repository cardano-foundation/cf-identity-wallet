import { Saider, Serder } from "signify-ts";
import { IdentifierStorage } from "../records";
import { CoreEventEmitter } from "../event";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { Agent } from "../agent";
import { ConfigurationService } from "../../configuration";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";
import { CredentialStatus } from "./credentialService.types";
import { EventTypes } from "../event.types";
import {
  mockNotificationApplyIpex,
  mockNotificationGrantIpex,
  credentialMetadataRecord,
  mockGetSchema,
  credentialRecordProps,
  identifierMetadataRecord,
  multisigExnIpexOffer,
  multisigExnIpexAdmit,
  mockCredentialRecord,
  multisigExnIpexGrant,
  mockNotificationOfferIpex,
  mockNotificationAgreeIpex,
  getCredentialResponse,
  credentialProps,
  ipexGrantSerder,
  ipexGrantSig,
  ipexGrantEnd,
  ipexSubmitGrantSerder,
  ipexSubmitGrantSig,
  ipexSubmitGrantEnd,
  multisigParticipantsProps,
  ipexOfferSerder,
  ipexOfferSig,
  ipexSubmitOfferSerder,
  ipexSubmitOfferSig,
  ipexSubmitOfferEnd,
} from "../../__fixtures__/agent/ipexCommunicationFixture";
import { NotificationRoute } from "../agent.types";
import { gHab, mHab } from "../../__fixtures__/agent/multSigFixtures";

const notificationStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn().mockImplementation((id: string) => {
    if (id === "uuid") {
      return {
        id,
        createdAt: new Date("2024-04-29T11:01:04.903Z"),
        a: {
          d: "saidForUuid",
        },
      };
    }
    return null;
  }),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  getCredentialMetadataByConnectionId: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
  getCredentialMetadatasById: jest.fn(),
});

const ipexMessageRecordStorage = jest.mocked({
  getIpexMessageMetadata: jest.fn(),
  getIpexMessageMetadataByConnectionId: jest.fn(),
  createIpexMessageRecord: jest.fn(),
});

const saveOperationPendingMock = jest.fn();
const operationPendingStorage = jest.mocked({
  save: saveOperationPendingMock,
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const multisigService = jest.mocked({
  multisigAdmit: jest.fn().mockResolvedValue({ name: "opName", done: true }),
  offerPresentMultisigACDC: jest
    .fn()
    .mockResolvedValue({ name: "opName", done: true }),
  getMultisigParticipants: jest.fn(),
});

let credentialListMock = jest.fn();
let credentialGetMock = jest.fn();
const identifierListMock = jest.fn();
const identifiersMemberMock = jest.fn();
let identifiersGetMock = jest.fn();
const getMemberMock = jest.fn();
const createExchangeMessageMock = jest.fn();

const now = new Date();

let getExchangeMock = jest.fn().mockImplementation((id: string) => {
  if (id == "saidForUuid") {
    return {
      exn: {
        a: {
          i: "uuid",
          a: {},
          s: "schemaSaid",
        },
        i: "i",
        e: {
          acdc: {
            d: "id",
            a: {
              dt: new Date().toISOString(),
            },
          },
        },
      },
    };
  }
  return;
});

const ipexOfferMock = jest.fn();
const ipexGrantMock = jest.fn();
const schemaGetMock = jest.fn();
const ipexSubmitOfferMock = jest.fn();
const ipexSubmitGrantMock = jest
  .fn()
  .mockResolvedValue({ name: "opName", done: true });
const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const submitAdmitMock = jest.fn().mockResolvedValue({
  name: "opName",
  done: true,
});
const markNotificationMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifierListMock,
    get: identifiersGetMock,
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: identifiersMemberMock,
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      return {
        done: true,
        response: {
          i: id,
        },
      };
    }),
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
    mark: markNotificationMock,
  }),
  ipex: () => ({
    admit: jest.fn().mockResolvedValue(["admit", "sigs", "aend"]),
    submitAdmit: submitAdmitMock,
    offer: ipexOfferMock,
    submitOffer: ipexSubmitOfferMock,
    grant: ipexGrantMock,
    submitGrant: ipexSubmitGrantMock,
  }),
  credentials: () => ({
    list: credentialListMock,
    get: credentialGetMock,
  }),
  exchanges: () => ({
    get: getExchangeMock,
    send: jest.fn(),
    createExchangeMessage: createExchangeMessageMock,
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
  schemas: () => ({
    get: schemaGetMock,
  }),
  manager: {
    get: getMemberMock,
  },
});

jest.mock("signify-ts", () => ({
  Serder: jest.fn().mockImplementation(() => {
    return {};
  }),
  Saider: {
    saidify: jest.fn().mockImplementation(() => {
      return ["mockSaid", { d: "mockKed" }];
    }),
  },
  Siger: jest.fn().mockImplementation(() => {
    return {};
  }),
  messagize: jest.fn().mockImplementation(() => {
    return {};
  }),
  d: jest.fn().mockImplementation(() => "d"),
  b: jest.fn().mockImplementation(() => "b"),
}));

const eventEmitter = new CoreEventEmitter();

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter: eventEmitter,
};

const resolveOobiMock = jest.fn();
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        resolveOobi: () => resolveOobiMock(),
      },
      ipexCommunications: {
        acceptAcdcFromMultisigExn: jest.fn(),
      },
      multiSigs: {
        multisigAdmit: jest.fn().mockResolvedValue({ name: "opName" }),
      },
    },
  },
}));

const connections = jest.mocked({
  resolveOobi: jest.fn(),
});

const ipexCommunicationService = new IpexCommunicationService(
  agentServicesProps,
  identifierStorage as any,
  credentialStorage as any,
  notificationStorage as any,
  ipexMessageRecordStorage as any,
  operationPendingStorage as any,
  multisigService as any,
  connections as any
);

describe("Ipex communication service of agent", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });

  test("Can accept ACDC", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: new Date(),
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/grant",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    });

    getExchangeMock = jest.fn().mockReturnValue(mockNotificationGrantIpex);

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    schemaGetMock.mockResolvedValue(mockGetSchema);

    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue({
      id: "id",
    });
    eventEmitter.emit = jest.fn();

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });

    await ipexCommunicationService.acceptAcdc(id);

    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith(
      credentialRecordProps
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.AcdcStateChanged,
      payload: {
        credential: credentialRecordProps,
        status: CredentialStatus.PENDING,
      },
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeReceiveCredential,
        },
      },
    });
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith(
      expect.objectContaining({
        historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
      })
    );
    expect(notificationStorage.deleteById).toBeCalledWith(id);
  });

  test("Cannot accept ACDC if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  // This logic must change if we are accepting presentations later.
  test("Cannot accept ACDC if identifier is not locally stored", async () => {
    // @TODO - foconnor: Ensure syncing process resovles this edge case of identifier in cloud but not local prior to release.
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    notificationStorage.findById = jest.fn().mockResolvedValue({
      id,
      createdAt: new Date("2024-04-29T11:01:04.903Z"),
      a: {
        d: "saidForUuid",
      },
      linkedGroupRequests: {},
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY
    );
    expect(deleteNotificationMock).not.toBeCalledWith(id);
  });

  test("Should throw an error when KERIA is offline", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    await expect(
      ipexCommunicationService.acceptAcdc("id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
  });

  test("Can offer Keri Acdc when received the ipex apply", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = new Date();
    const noti = {
      id,
      createdAt: date.toISOString(),
      a: {
        d: "keri",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: new Date(),
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    });

    getExchangeMock = jest.fn().mockReturnValueOnce({
      exn: {
        a: {
          s: "schemaSaid",
        },
        i: "i",
        d: "d",
      },
    });
    credentialListMock = jest.fn().mockReturnValue({});
    identifierStorage.getIdentifierMetadata = jest.fn().mockReturnValue({
      id: "abc123",
    });
    ipexOfferMock.mockResolvedValue(["offer", "sigs", "gend"]);
    ipexSubmitOfferMock.mockResolvedValue({ name: "opName", done: true }),
    await ipexCommunicationService.offerAcdcFromApply(noti.id, {});
    expect(ipexOfferMock).toBeCalledWith({
      senderName: "abc123",
      recipient: "i",
      acdc: expect.anything(),
      applySaid: "d",
    });
    expect(markNotificationMock).toBeCalledWith(id);
    expect(notificationStorage.deleteById).toBeCalledWith(id);
  });

  test("Can grant Keri Acdc when received the ipex agree", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = new Date().toISOString();
    const noti = {
      id,
      createdAt: date,
      a: {
        d: "agreeD",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    getExchangeMock = jest.fn().mockImplementation((id) => {
      if (id === "agreeD") {
        return {
          exn: {
            p: "offderD",
            i: "i",
          },
        };
      }
      return {
        exn: {
          e: {
            acdc: {
              d: "d",
            },
          },
          a: {
            i: "i",
          },
          i: "i",
        },
      };
    });
    credentialGetMock = jest.fn().mockReturnValue({});
    identifierStorage.getIdentifierMetadata = jest.fn().mockReturnValue({
      id: "abc123",
    });
    ipexGrantMock.mockResolvedValue(["offer", "sigs", "gend"]);
    await ipexCommunicationService.grantAcdcFromAgree(noti.a.d);
    expect(ipexGrantMock).toBeCalledWith({
      acdc: {},
      acdcAttachment: undefined,
      anc: {},
      ancAttachment: undefined,
      iss: {},
      issAttachment: undefined,
      recipient: "i",
      senderName: "abc123",
    });
  });

  test("Can not grant Keri Acdc if aid is not existed", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = new Date().toISOString();
    const noti = {
      id,
      createdAt: date,
      a: {
        d: "agreeD",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    getExchangeMock = jest.fn().mockImplementation((id) => {
      if (id === "agreeD") {
        return {
          exn: {
            p: "offderD",
            i: "i",
          },
        };
      }
      return {
        exn: {
          e: {
            acdc: {
              d: "d",
            },
          },
          a: {
            i: "i",
          },
          i: "i",
        },
      };
    });
    credentialGetMock = jest.fn().mockReturnValue({});
    identifierStorage.getIdentifierMetadata =
      identifierStorage.getIdentifierMetadata = jest
        .fn()
        .mockRejectedValue(
          new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
        );
    await expect(
      ipexCommunicationService.grantAcdcFromAgree(noti.a.d)
    ).rejects.toThrowError(
      IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
    );
  });

  test("Can not grant Keri Acdc if acdc is not existed", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = new Date().toISOString();
    const noti = {
      id,
      createdAt: date,
      a: {
        d: "agreeD",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    getExchangeMock = jest.fn().mockImplementation((id) => {
      if (id === "agreeD") {
        return {
          exn: {
            p: "offderD",
            i: "i",
          },
        };
      }
      return {
        exn: {
          e: {
            acdc: {
              d: "d",
            },
          },
        },
      };
    });
    credentialGetMock = jest.fn().mockReturnValue(null);
    await expect(
      ipexCommunicationService.grantAcdcFromAgree(noti.a.d)
    ).rejects.toThrowError(IpexCommunicationService.CREDENTIAL_NOT_FOUND);
  });

  test("Can get matching credential for apply", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const notiId = "notiId";
    const mockExchange = {
      exn: {
        a: {
          i: "uuid",
          a: {
            fullName: "Mr. John Lucas Smith",
            licenseNumber: "SMITH01192OP",
          },
          s: "schemaSaid",
        },
        i: "i",
        rp: "id",
        e: {},
      },
    };
    getExchangeMock = jest.fn().mockResolvedValueOnce(mockExchange);
    const noti = {
      id: notiId,
      createdAt: new Date("2024-04-29T11:01:04.903Z").toISOString(),
      a: {
        d: "saidForUuid",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    schemaGetMock.mockResolvedValue(mockGetSchema);
    credentialStorage.getCredentialMetadatasById.mockResolvedValue([
      {
        id: "d",
        status: "confirmed",
        connectionId: "connectionId",
        isArchived: false,
        isDeleted: false,
      },
    ]);
    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "d",
        },
      },
    ]);
    expect(await ipexCommunicationService.getIpexApplyDetails(noti)).toEqual({
      credentials: [{ acdc: { d: "d" }, connectionId: "connectionId" }],
      schema: {
        description: "Qualified vLEI Issuer Credential",
        name: "Qualified vLEI Issuer Credential",
      },
      attributes: {
        fullName: "Mr. John Lucas Smith",
        licenseNumber: "SMITH01192OP",
      },
    });
    expect(credentialListMock).toBeCalledWith({
      filter: expect.objectContaining({
        "-s": { $eq: mockExchange.exn.a.s },
        "-a-i": mockExchange.exn.rp,
      }),
    });
  });

  test("Can create linked ipex message record", async () => {
    schemaGetMock.mockResolvedValueOnce(mockGetSchema);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      mockNotificationGrantIpex,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: mockNotificationGrantIpex.exn.d,
      credentialType: mockGetSchema.title,
      content: mockNotificationGrantIpex,
      connectionId: mockNotificationGrantIpex.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
    });

    schemaGetMock.mockResolvedValueOnce(mockGetSchema);
    getExchangeMock.mockResolvedValueOnce({
      exn: {
        e: {
          acdc: {
            s: "s",
          },
        },
      },
    });
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      mockNotificationGrantIpex,
      ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE
    );
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: mockNotificationGrantIpex.exn.d,
      credentialType: mockGetSchema.title,
      content: mockNotificationGrantIpex,
      connectionId: mockNotificationGrantIpex.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE,
    });
    expect(schemaGetMock).toBeCalledTimes(2);
    expect(connections.resolveOobi).toBeCalledTimes(2);
  });

  test("Can create linked ipex message record with message exchange route ipex/apply", async () => {
    schemaGetMock.mockResolvedValueOnce(mockGetSchema);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      mockNotificationApplyIpex,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );

    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: mockNotificationApplyIpex.exn.d,
      credentialType: mockGetSchema.title,
      content: mockNotificationApplyIpex,
      connectionId: mockNotificationApplyIpex.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
    });
    expect(schemaGetMock).toBeCalledTimes(1);
    expect(connections.resolveOobi).toBeCalledTimes(1);
  });

  test("Can create linked ipex message record with message exchange route ipex/agree", async () => {
    schemaGetMock.mockResolvedValueOnce(mockGetSchema);
    getExchangeMock.mockResolvedValueOnce(mockNotificationAgreeIpex);

    await ipexCommunicationService.createLinkedIpexMessageRecord(
      mockNotificationAgreeIpex,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );

    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: mockNotificationAgreeIpex.exn.d,
      credentialType: mockGetSchema.title,
      content: mockNotificationAgreeIpex,
      connectionId: mockNotificationAgreeIpex.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
    });
    expect(schemaGetMock).toBeCalledTimes(1);
    expect(connections.resolveOobi).toBeCalledTimes(1);
  });

  test("Should throw error if schemas.get has an unexpected error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    schemaGetMock.mockRejectedValueOnce(new Error("Unknown error"));
    await expect(
      ipexCommunicationService.createLinkedIpexMessageRecord(
        mockNotificationGrantIpex,
        ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
      )
    ).rejects.toThrowError(new Error("Unknown error"));
  });

  test("Cannot get matching credential for apply if Cannot get the schema", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const notiId = "notiId";
    getExchangeMock = jest.fn().mockResolvedValueOnce({
      exn: {
        a: {
          i: "uuid",
          a: {},
          s: "schemaSaid",
        },
        i: "i",
        e: {},
      },
    });
    const noti = {
      id: notiId,
      createdAt: new Date("2024-04-29T11:01:04.903Z").toISOString(),
      a: {
        d: "saidForUuid",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    schemaGetMock.mockResolvedValue(null);
    await expect(
      ipexCommunicationService.getIpexApplyDetails(noti)
    ).rejects.toThrowError(IpexCommunicationService.SCHEMA_NOT_FOUND);
  });

  test("Should throw error when KERIA is offline", async () => {
    await expect(
      ipexCommunicationService.acceptAcdc("id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    const noti = {
      id: "id",
      createdAt: new Date().toISOString(),
      a: {
        d: "keri",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    await expect(
      ipexCommunicationService.offerAcdcFromApply(noti.id, {})
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      ipexCommunicationService.grantAcdcFromAgree(noti.a.d)
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      ipexCommunicationService.getIpexApplyDetails(noti)
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
  });

  test("should return undefined when schemaSaid returns 404", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const mockNotification = {
      a: {
        d: "msgSaid",
      },
    } as any;

    const mockMsg = {
      exn: {
        a: {
          s: "schemaSaid",
          a: {},
        },
        rp: "recipient",
      },
    };

    getExchangeMock.mockResolvedValueOnce(mockMsg);
    const error404 = new Error("Not Found - 404");
    schemaGetMock.mockRejectedValueOnce(error404);

    await expect(
      ipexCommunicationService.getIpexApplyDetails(mockNotification)
    ).rejects.toThrow(IpexCommunicationService.SCHEMA_NOT_FOUND);

    expect(getExchangeMock).toHaveBeenCalledWith("msgSaid");
    expect(schemaGetMock).toHaveBeenCalledWith("schemaSaid");
  });

  test("should throw error for non-404 errors", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const mockNotification = {
      a: {
        d: "msgSaid",
      },
    } as any;

    const mockMsg = {
      exn: {
        a: {
          s: "schemaSaid",
          a: {},
        },
        rp: "recipient",
      },
    };

    getExchangeMock.mockResolvedValueOnce(mockMsg);
    const errorMessage = "Error - 500";
    schemaGetMock.mockRejectedValueOnce(new Error(errorMessage));

    await expect(
      ipexCommunicationService.getIpexApplyDetails(mockNotification)
    ).rejects.toThrow(new Error(errorMessage));

    expect(getExchangeMock).toHaveBeenCalledWith("msgSaid");
    expect(schemaGetMock).toHaveBeenCalledWith("schemaSaid");
  });

  test("Can accept ACDC from multisig exn", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: new Date(),
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/grant",
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: false,
          saids: ["EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw"],
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    });

    getExchangeMock
      .mockReturnValueOnce(multisigExnIpexAdmit)
      .mockReturnValueOnce(mockNotificationGrantIpex);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    schemaGetMock.mockResolvedValue(mockGetSchema);
    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "id",
        },
      },
    ]);
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue(null);
    multisigService.multisigAdmit = jest
      .fn()
      .mockResolvedValue({ op: { name: "opName", done: true } });

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: id,
        createdAt: new Date(),
        a: {
          r: "/exn/ipex/grant",
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: "/exn/ipex/grant",
        read: true,
        linkedGroupRequests: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    eventEmitter.emit = jest.fn();

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });

    await ipexCommunicationService.acceptAcdc(id);

    expect(notificationStorage.deleteById).toBeCalledTimes(0);
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeReceiveCredential,
        },
      },
    });
  });

  test("Can accept ACDC and update linkedGroupRequests when FIRST of multisig joins", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/grant",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
    getExchangeMock.mockReturnValueOnce(mockNotificationGrantIpex);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);
    schemaGetMock.mockResolvedValue(mockGetSchema);

    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecord);

    multisigService.multisigAdmit = jest.fn().mockResolvedValue({
      op: { name: "opName", done: false },
      exnSaid: "exnSaid",
      ipexAdmitSaid: "ipexAdmitSaid",
      member: "member1",
    });

    eventEmitter.emit = jest.fn();

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });

    await ipexCommunicationService.acceptAcdc("id");

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/grant",
      read: true,
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: true,
          saids: {
            ipexAdmitSaid: [["member1", "exnSaid"]],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });

    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith(
      credentialRecordProps
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.AcdcStateChanged,
      payload: {
        credential: credentialRecordProps,
        status: CredentialStatus.PENDING,
      },
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeReceiveCredential,
        },
      },
    });
    expect(notificationStorage.deleteById).toBeCalledTimes(0);
  });

  test("Can accept ACDC from multisig exn and update linkedGroupRequests when SECOND of multisig joins", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/grant",
      read: true,
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: false,
          saids: {
            ipexAdmitSaid: [
              ["member2", "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw"],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValue(notificationRecord);

    getExchangeMock
      .mockReturnValueOnce(multisigExnIpexAdmit)
      .mockReturnValueOnce(mockNotificationGrantIpex);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecord);

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notificationRecord]);

    await ipexCommunicationService.acceptAcdc("id");

    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledTimes(0);
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });

    expect(notificationStorage.update).lastCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/grant",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/grant",
      read: true,
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: true,
          saids: {
            ipexAdmitSaid: [
              ["member2", "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw"],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test("Can join offer ACDC from multisig exn", async () => {
    eventEmitter.emit = jest.fn();
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    getExchangeMock.mockReturnValueOnce(multisigExnIpexOffer);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notificationRecord]);

    jest
      .spyOn(ipexCommunicationService, "multisigOfferAcdcFromApply")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexOfferSaid: "ipexOfferSaid",
        member: "member1",
        exnSaid: "exnSaid",
      });

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    await ipexCommunicationService.joinMultisigOffer("multiSigExnSaid");

    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeOfferCredential,
        },
      },
    });

    expect(notificationStorage.update).lastCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test("Can join grant ACDC from multisig exn", async () => {
    eventEmitter.emit = jest.fn();
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/agree",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/agree",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    getExchangeMock.mockReturnValueOnce(multisigExnIpexGrant);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notificationRecord]);

    jest
      .spyOn(ipexCommunicationService, "multisigGrantAcdcFromAgree")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexGrantSaid: "ipexGrantSaid",
        member: "member1",
        exnSaid: "exnSaid",
      });

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });

    await ipexCommunicationService.joinMultisigGrant("multiSigExnSaid");

    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangePresentCredential,
        },
      },
    });

    expect(notificationStorage.update).lastCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/agree",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/agree",
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test("Cannot join offer ACDC from multisig exn if identifier is not locally stored", async () => {
    const id = "uuid";
    getExchangeMock.mockReturnValueOnce({
      exn: {
        v: "KERI10JSON00032d_",
        t: "exn",
        d: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
        i: "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
        rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
        p: "",
        dt: "2024-08-28T06:39:55.501000+00:00",
        r: "/multisig/exn",
        q: {},
        a: {
          i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
          gid: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
        },
        e: {
          exn: {
            v: "KERI10JSON000178_",
            t: "exn",
            d: "EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt",
            i: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
            rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
            p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
            dt: "2024-08-28T06:39:51.416000+00:00",
            r: "/ipex/grant",
            q: {},
            a: {
              i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
              m: "",
            },
            e: {
              acdc: { d: "EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT" },
            },
          },
          d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
        },
      },
      pathed: {},
    });

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(
      ipexCommunicationService.joinMultisigOffer(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(deleteNotificationMock).not.toBeCalledWith(id);
  });

  test("Cannot join grant ACDC from multisig exn if identifier is not locally stored", async () => {
    const id = "uuid";
    getExchangeMock.mockReturnValueOnce({
      exn: {
        v: "KERI10JSON00032d_",
        t: "exn",
        d: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
        i: "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
        rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
        p: "",
        dt: "2024-08-28T06:39:55.501000+00:00",
        r: "/multisig/exn",
        q: {},
        a: {
          i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
          gid: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
        },
        e: {
          exn: {
            v: "KERI10JSON000178_",
            t: "exn",
            d: "EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt",
            i: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
            rp: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
            p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
            dt: "2024-08-28T06:39:51.416000+00:00",
            r: "/ipex/grant",
            q: {},
            a: {
              i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
              m: "",
            },
            e: {
              acdc: { d: "EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT" },
            },
          },
          d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
        },
      },
      pathed: {},
    });

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(
      ipexCommunicationService.joinMultisigGrant(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(deleteNotificationMock).not.toBeCalledWith(id);
  });

  test("Should join multisig offer if linkedGroupRequestDetails exists and is not accepted", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "id";
    const applyNoteRecord = {
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: false,
          saids: {
            ipexOfferSaid: [["member1", "exnSaid1"]],
          },
        },
      },
    };

    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    eventEmitter.emit = jest.fn();
    notificationStorage.findById.mockResolvedValueOnce(applyNoteRecord);
    getExchangeMock.mockReturnValueOnce(multisigExnIpexOffer);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(identifierMetadataRecord);

    jest
      .spyOn(ipexCommunicationService, "multisigOfferAcdcFromApply")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexOfferSaid: "ipexOfferSaid",
        member: "member1",
        exnSaid: "exnSaid",
      });

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notificationRecord]);

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    await ipexCommunicationService.offerAcdcFromApply(id, mockCredentialRecord);

    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeOfferCredential,
        },
      },
    });

    expect(notificationStorage.update).lastCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test("Should return early if linkedGroupRequestDetails is accepted", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "id";
    const applyNoteRecord = {
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            ipexOfferSaid: [["member1", "exnSaid1"]],
          },
        },
      },
    };

    ipexCommunicationService.joinMultisigOffer = jest.fn();
    notificationStorage.findById.mockResolvedValue(applyNoteRecord);

    await ipexCommunicationService.offerAcdcFromApply(id, mockCredentialRecord);

    expect(ipexCommunicationService.joinMultisigOffer).not.toHaveBeenCalled();
  });

  test("Can offer ACDC from multisig exn", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";
    eventEmitter.emit = jest.fn();

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: new Date(),
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    });

    getExchangeMock.mockReturnValueOnce(multisigExnIpexOffer);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(identifierMetadataRecord);

    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "id",
        },
      },
    ]);
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValueOnce(null);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValueOnce([
      {
        type: "NotificationRecord",
        id: id,
        createdAt: new Date(),
        a: {
          r: "/exn/ipex/apply",
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: "/exn/ipex/apply",
        read: true,
        linkedGroupRequests: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    multisigService.getMultisigParticipants.mockResolvedValueOnce(
      multisigParticipantsProps
    );

    jest
      .spyOn(ipexCommunicationService, "multisigOfferAcdcFromApply")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexOfferSaid: "ipexOfferSaid",
        member: "member1",
        exnSaid: "exnSaid",
      });

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    await ipexCommunicationService.offerAcdcFromApply(id, mockCredentialRecord);

    expect(notificationStorage.deleteById).toBeCalledTimes(0);
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeOfferCredential,
        },
      },
    });
  });

  test("Can offer ACDC and update linkedGroupRequests when FIRST of multisig joins", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    eventEmitter.emit = jest.fn();

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });

    getExchangeMock.mockResolvedValueOnce(mockNotificationApplyIpex);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    multisigService.offerPresentMultisigACDC = jest.fn().mockResolvedValue({
      op: { name: "opName", done: false },
      exnSaid: "exnSaid",
    });

    jest
      .spyOn(ipexCommunicationService, "multisigOfferAcdcFromApply")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexOfferSaid: "ipexOfferSaid",
        member: "member1",
        exnSaid: "exnSaid",
      });

    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    await ipexCommunicationService.offerAcdcFromApply(
      "id",
      mockCredentialRecord
    );

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            ipexOfferSaid: [["member1", "exnSaid"]],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });

    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: "opName",
          recordType: OperationPendingRecordType.ExchangeOfferCredential,
        },
      },
    });
    expect(notificationStorage.deleteById).toBeCalledTimes(0);
  });

  test("Can offer ACDC from multisig exn and update linkedGroupRequests when SECOND of multisig joins", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    notificationStorage.findById = jest
      .fn()
      .mockResolvedValue(notificationRecord);

    getExchangeMock
      .mockReturnValueOnce(multisigExnIpexOffer)
      .mockReturnValueOnce(mockNotificationGrantIpex);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notificationRecord]);

    multisigService.offerPresentMultisigACDC = jest.fn().mockResolvedValue({
      op: { name: "opName", done: true },
      exnSaid: "exnSaid",
    });

    jest
      .spyOn(ipexCommunicationService, "multisigOfferAcdcFromApply")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexOfferSaid: "ipexOfferSaid",
        member: "member1",
        exnSaid: "exnSaid",
      });

    await ipexCommunicationService.offerAcdcFromApply(
      "id",
      mockCredentialRecord
    );

    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    expect(notificationStorage.update).lastCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: "/exn/ipex/apply",
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: "/exn/ipex/apply",
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            ipexOfferSaid: [["member1", "exnSaid"]],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  //
  test("Can initiate offering an ACDC from a multi-sig identifier", async () => {
    const multisigId = "multisigId";
    const discloseePrefix = "discloseePrefix";

    multisigService.getMultisigParticipants.mockResolvedValueOnce(
      multisigParticipantsProps
    );

    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);
    ipexOfferMock.mockResolvedValue([ipexOfferSerder, ipexOfferSig, ""]);
    createExchangeMessageMock.mockResolvedValueOnce([
      ipexSubmitOfferSerder,
      ipexSubmitOfferSig,
      ipexSubmitOfferEnd,
    ]);

    await ipexCommunicationService.multisigOfferAcdcFromApply(
      multisigId,
      "applySaid",
      credentialProps,
      discloseePrefix
    );
    expect(ipexOfferMock).toBeCalledTimes(1);
    expect(createExchangeMessageMock).toBeCalledTimes(1);
    expect(ipexSubmitOfferMock).toBeCalledTimes(1);
  });

  test("Can agree to offer an ACDC with a multi-sig identifier", async () => {
    const multisigId = "multisigId";
    const discloseePrefix = "discloseePrefix";
    const offer = {
      ked: { d: "EKJEr0WbRERI1j2GjjfuReOIHjBSjC0tXguEaNYo5Hl6" },
    };

    multisigService.getMultisigParticipants.mockResolvedValueOnce(
      multisigParticipantsProps
    );

    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);

    (Saider.saidify as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue([{} as Saider, ipexOfferSerder.ked])
    );

    (Serder as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue({
        ked: { d: "EKJEr0WbRERI1j2GjjfuReOIHjBSjC0tXguEaNYo5Hl6" },
      })
    );

    getMemberMock.mockResolvedValue({
      sign: () => [
        "ABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB",
      ],
    });
    createExchangeMessageMock.mockResolvedValueOnce([
      ipexSubmitOfferSerder,
      ipexSubmitOfferSig,
      ipexSubmitOfferEnd,
    ]);

    getMemberMock.mockImplementationOnce(() => {
      return {
        sign: jest.fn().mockResolvedValueOnce(["mockSign"]),
      };
    });

    await ipexCommunicationService.multisigOfferAcdcFromApply(
      multisigId,
      "applySaid",
      credentialProps,
      discloseePrefix,
      ipexOfferSerder
    );

    expect(ipexOfferMock).toBeCalledTimes(0);
    expect(createExchangeMessageMock).toBeCalledWith(
      mHab,
      "/multisig/exn",
      {
        gid: gHab["prefix"],
      },
      {
        exn: [offer, "d"],
      },
      "discloseePrefix"
    );

    expect(ipexSubmitOfferMock).toBeCalledWith(
      multisigId,
      ipexSubmitOfferSerder,
      ipexSubmitOfferSig,
      ipexSubmitOfferEnd,
      [
        "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF",
        "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
      ]
    );
  });

  test("Should join multisig agree if linkedGroupRequestDetails exists and is not accepted", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "id";
    const agreeNoteRecord = {
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: false,
          saids: {
            ipexGrantSaid: [["member", "exnSaid"]],
          },
        },
      },
    };

    ipexCommunicationService.joinMultisigGrant = jest.fn();
    notificationStorage.findById.mockResolvedValueOnce(agreeNoteRecord);
    getExchangeMock
      .mockReturnValueOnce(mockNotificationAgreeIpex)
      .mockReturnValueOnce(mockNotificationOfferIpex);

    await ipexCommunicationService.grantAcdcFromAgree(id);

    expect(ipexCommunicationService.joinMultisigGrant).toHaveBeenCalledWith(
      "exnSaid"
    );
    expect(notificationStorage.update).not.toHaveBeenCalled();
  });

  test("Can initiate granting an ACDC from a multi-sig identifier", async () => {
    const multisigId = "multisigId";
    const discloseePrefix = "discloseePrefix";

    multisigService.getMultisigParticipants.mockResolvedValueOnce(
      multisigParticipantsProps
    );

    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);
    ipexGrantMock.mockResolvedValue([
      ipexGrantSerder,
      ipexGrantSig,
      ipexGrantEnd,
    ]);
    createExchangeMessageMock.mockResolvedValueOnce([
      ipexSubmitGrantSerder,
      ipexSubmitGrantSig,
      ipexSubmitGrantEnd,
    ]);

    await ipexCommunicationService.multisigGrantAcdcFromAgree(
      multisigId,
      discloseePrefix,
      "agreeSaid",
      credentialProps
    );
    expect(ipexGrantMock).toBeCalledTimes(1);
    expect(createExchangeMessageMock).toBeCalledTimes(1);
    expect(ipexSubmitGrantMock).toBeCalledTimes(1);
  });

  test("Can agree to grant an ACDC with a multi-sig identifier", async () => {
    const multisigId = "multisigId";
    const discloseePrefix = "discloseePrefix";
    const grant = {
      ked: { d: "EKJEr0WbRERI1j2GjjfuReOIHjBSjC0tXguEaNYo5Hl6" },
    };

    const atc =
      "dFABEFr4DyYerYKgdUq3Nw5wbq7OjEZT6cn45omHCiIZ0elD0AAAAAAAAAAAAAAAAAAAAAAAEMoyFLuJpu0B79yPM7QKFE_R_D4CTq7H7GLsKxIpukXX-AABABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB-LAg4AACA-e-acdc-IABEEGUqZhZh6xzLrSINDvIN7bRPpMWZ2U9_ZqOcHMlhgbg0AAAAAAAAAAAAAAAAAAAAAAAEMVYTf_mX61cKxVRbdWBHogVLNnb5vAfzXhKmNjEAIus-LAW5AACAA-e-iss-VAS-GAB0AAAAAAAAAAAAAAAAAAAAAAAEB9sUjT1dKIqXTw2UJRVnyOSR37jj_NX6JXYtOh8jlYD-LAa5AACAA-e-anc-AABAABiw1xpT74ifuhdys2komq-9ZCUznqZcfRYHU27320gTdtBT3ijTshz2csLTcK77nw-dEssXfc4VEru-0Loq6wK";

    multisigService.getMultisigParticipants.mockResolvedValueOnce(
      multisigParticipantsProps
    );

    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);

    (Saider.saidify as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue([{} as Saider, ipexGrantSerder.ked])
    );

    (Serder as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue({
        ked: { d: "EKJEr0WbRERI1j2GjjfuReOIHjBSjC0tXguEaNYo5Hl6" },
      })
    );

    getMemberMock.mockResolvedValue({
      sign: () => [
        "ABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB",
      ],
    });
    createExchangeMessageMock.mockResolvedValueOnce([
      ipexSubmitGrantSerder,
      ipexSubmitGrantSig,
      ipexSubmitGrantEnd,
    ]);

    getMemberMock.mockImplementationOnce(() => {
      return {
        sign: jest.fn().mockResolvedValueOnce(["mockSign"]),
      };
    });

    await ipexCommunicationService.multisigGrantAcdcFromAgree(
      multisigId,
      discloseePrefix,
      "agreeSaid",
      credentialProps,
      {
        grantExn: ipexGrantSerder as any,
        atc,
      }
    );

    expect(ipexGrantMock).toBeCalledTimes(0);
    expect(createExchangeMessageMock).toBeCalledWith(
      mHab,
      "/multisig/exn",
      {
        gid: gHab["prefix"],
      },
      {
        exn: [grant, atc],
      },
      "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF"
    );

    expect(ipexSubmitGrantMock).toBeCalledWith(
      multisigId,
      ipexSubmitGrantSerder,
      ipexSubmitGrantSig,
      ipexSubmitGrantEnd,
      [
        "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF",
        "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
      ]
    );
  });

  test("Can join grant present credential with multisig exn", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);

    const id = "id";
    const agreeNoteRecord = {
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      linkedGroupRequests: {},
    };

    notificationStorage.findById.mockResolvedValueOnce(agreeNoteRecord);
    getExchangeMock
      .mockReturnValueOnce(mockNotificationAgreeIpex)
      .mockReturnValueOnce(mockNotificationOfferIpex);
    credentialGetMock.mockReturnValue(getCredentialResponse);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecord);

    jest
      .spyOn(ipexCommunicationService, "multisigGrantAcdcFromAgree")
      .mockResolvedValueOnce({
        op: { name: "opName", done: true },
        ipexGrantSaid: "ipexGrantSaid",
        member: "member",
        exnSaid: "exnSaid",
      });

    await ipexCommunicationService.grantAcdcFromAgree(id);

    expect(
      ipexCommunicationService.multisigGrantAcdcFromAgree
    ).toHaveBeenCalledWith(
      "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
      getCredentialResponse
    );

    expect(notificationStorage.update).toHaveBeenCalledWith({
      ...agreeNoteRecord,
      linkedGroupRequests: {
        "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli": {
          accepted: true,
          saids: {
            ipexGrantSaid: [["member", "exnSaid"]],
          },
        },
      },
    });
  });

  test("Can accept ACDC from multisig exn when existing credential", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";
    getExchangeMock
      .mockReturnValueOnce(multisigExnIpexAdmit)
      .mockReturnValueOnce(mockNotificationGrantIpex);
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue({
      id: "id",
    });
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: id,
        createdAt: new Date(),
        a: {
          r: "/exn/ipex/grant",
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: "/exn/ipex/grant",
        read: true,
        linkedGroupRequests: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await ipexCommunicationService.acceptAcdc(id);
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledTimes(0);
  });

  test("Cannot accept ACDC from multisig exn if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById.mockResolvedValueOnce(null);

    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test("Cannot accept ACDC from multisig exn if identifier is not locally stored", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      id,
      createdAt: new Date("2024-04-29T11:01:04.903Z"),
      a: {
        d: "saidForUuid",
      },
    });

    signifyClient.exchanges = jest.fn().mockReturnValue({
      get: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(multisigExnIpexAdmit))
        .mockImplementationOnce(() =>
          Promise.resolve(mockNotificationGrantIpex)
        ),
    });

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(undefined);

    await expect(
      ipexCommunicationService.acceptAcdcFromMultisigExn(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(notificationStorage.deleteById).not.toBeCalledWith(id);
  });

  test("Cannot offer ACDC from multisig exn if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById.mockResolvedValueOnce(null);

    await expect(
      ipexCommunicationService.offerAcdcFromApply(id, {})
    ).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test("Cannot grant ACDC from multisig exn if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById.mockResolvedValueOnce(null);

    await expect(
      ipexCommunicationService.grantAcdcFromAgree(id)
    ).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test("Can get acdc detail", async () => {
    signifyClient.exchanges = jest.fn().mockReturnValue({
      get: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve(mockNotificationGrantIpex)
        ),
    });

    schemaGetMock.mockResolvedValue(mockGetSchema);

    expect(
      await ipexCommunicationService.getAcdcFromIpexGrant(
        "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL"
      )
    ).toEqual({
      id: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
      schema: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
      i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      a: {
        d: "ELHCh_X2aw7C-aYesOM4La23a5lsoNuJDuCsJuxwO2nq",
        i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
        dt: "2024-07-30T04:19:55.348000+00:00",
        attendeeName: "ccc",
      },
      s: mockGetSchema,
      lastStatus: { s: "0", dt: "2024-07-30T04:19:55.348Z" },
      status: "pending",
    });
  });

  test("Can get acdc detail when the schema has not been resolved", async () => {
    signifyClient.exchanges = jest.fn().mockReturnValue({
      get: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve(mockNotificationGrantIpex)
        ),
    });
    const error404 = new Error("Not Found - 404");
    schemaGetMock.mockRejectedValueOnce(error404);

    resolveOobiMock.mockResolvedValueOnce({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });

    expect(
      await ipexCommunicationService.getAcdcFromIpexGrant(
        "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL"
      )
    ).toEqual({
      id: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
      schema: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
      i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      a: {
        d: "ELHCh_X2aw7C-aYesOM4La23a5lsoNuJDuCsJuxwO2nq",
        i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
        dt: "2024-07-30T04:19:55.348000+00:00",
        attendeeName: "ccc",
      },
      s: mockGetSchema,
      lastStatus: { s: "0", dt: "2024-07-30T04:19:55.348Z" },
      status: "pending",
    });
  });

  test("Throws error if the schema has not been resolved and with a non-404 error", async () => {
    signifyClient.exchanges = jest.fn().mockReturnValue({
      get: jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve(mockNotificationGrantIpex)
        ),
    });
    const error = new Error("Some other error - 500");
    schemaGetMock.mockRejectedValueOnce(error);

    await expect(
      ipexCommunicationService.getAcdcFromIpexGrant("said")
    ).rejects.toThrow("Some other error - 500");
    expect(schemaGetMock).toHaveBeenCalledTimes(1);
    expect(resolveOobiMock).not.toHaveBeenCalled();
  });
});
