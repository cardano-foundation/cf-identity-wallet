import { Saider, Serder } from "signify-ts";
import { IdentifierStorage } from "../records";
import { CoreEventEmitter } from "../event";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { Agent } from "../agent";
import { ConfigurationService } from "../../configuration";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { CredentialStatus } from "./credentialService.types";
import { EventTypes } from "../event.types";
import {
  applyForPresentingExnMessage,
  grantForIssuanceExnMessage,
  QVISchema,
  credentialRecordProps,
  groupIdentifierMetadataRecord,
  multisigExnOfferForPresenting,
  multisigExnAdmitForIssuance,
  credentialRecord,
  multisigExnGrant,
  offerForPresentingExnMessage,
  agreeForPresentingExnMessage,
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
  ipexAdmitEnd,
  ipexAdmitSig,
  ipexAdmitSerder,
  ipexSubmitAdmitSerder,
  ipexSubmitAdmitSig,
  ipexSubmitAdmitEnd,
  credentialStateIssued,
  credentialStateRevoked,
} from "../../__fixtures__/agent/ipexCommunicationFixtures";
import { NotificationRoute } from "../agent.types";
import {
  gHab,
  mHab,
  memberIdentifierRecord,
} from "../../__fixtures__/agent/multSigFixtures";
import {
  ConnectionHistoryType,
  KeriaContactKeyPrefix,
} from "./connectionService.types";

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
  offerPresentMultisigACDC: jest
    .fn()
    .mockResolvedValue({ name: "opName", done: true }),
  getMultisigParticipants: jest.fn(),
});

let credentialListMock = jest.fn();
const credentialGetMock = jest.fn();
const credentialStateMock = jest.fn();
const identifierListMock = jest.fn();
const identifiersMemberMock = jest.fn();
let identifiersGetMock = jest.fn();
const getManagerMock = jest.fn().mockResolvedValue("hahaha");
const getRequestMock = jest.fn();
const createExchangeMessageMock = jest.fn();

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
              dt: DATETIME.toISOString(),
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
const ipexAdmitMock = jest.fn();
const updateContactMock = jest.fn();

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
    update: updateContactMock,
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
    admit: ipexAdmitMock,
    submitAdmit: submitAdmitMock,
    offer: ipexOfferMock,
    submitOffer: ipexSubmitOfferMock,
    grant: ipexGrantMock,
    submitGrant: ipexSubmitGrantMock,
  }),
  credentials: () => ({
    list: credentialListMock,
    get: credentialGetMock,
    state: credentialStateMock,
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
    get: getManagerMock,
  },
  groups: () => ({
    getRequest: getRequestMock
  })
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
  Ilks: {
    iss: "iss",
  },
}));

const eventEmitter = new CoreEventEmitter();

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter: eventEmitter,
};

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {},
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
  operationPendingStorage as any,
  multisigService as any,
  connections as any
);

const DATETIME = new Date();

describe("Receive individual ACDC actions", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });

  test("Can accept ACDC from individual identifier and remove notification", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });
    getExchangeMock = jest.fn().mockReturnValue(grantForIssuanceExnMessage);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      id: "identifierId",
    });
    schemaGetMock.mockResolvedValue(QVISchema);
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue({
      id: "id",
    });
    eventEmitter.emit = jest.fn();
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    ipexAdmitMock.mockResolvedValue(["admit", "sigs", "aend"]);

    const connectionNote = {
      id: "note:id",
      title: "title",
      message: "message",
    };
    signifyClient.contacts().update = jest.fn().mockReturnValue(
      Promise.resolve({
        alias: "alias",
        oobi: "oobi",
        id: "id",
        [`${KeriaContactKeyPrefix.CONNECTION_NOTE}:id`]:
          JSON.stringify(connectionNote),
      })
    );

    await ipexCommunicationService.admitAcdc(id);

    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith({
      ...credentialRecordProps,
      identifierId: "identifierId",
      identifierType: "individual",
      createdAt: new Date(credentialRecordProps.issuanceDate)
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.AcdcStateChanged,
      payload: {
        credential: {
          ...credentialRecordProps,
          identifierId: "identifierId",
          identifierType: "individual",
          createdAt: new Date(credentialRecordProps.issuanceDate)
        },
        status: CredentialStatus.PENDING,
      },
    });
    expect(submitAdmitMock).toBeCalledWith(
      "identifierId",
      "admit",
      "sigs",
      "aend",
      ["EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x"]
    );
    expect(signifyClient.contacts().update).toBeCalledWith("EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x", {
      [`${KeriaContactKeyPrefix.HISTORY_IPEX}EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL`]: JSON.stringify({
        id: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
        dt: "2024-07-30T04:19:55.801000+00:00",
        credentialType: "Qualified vLEI Issuer Credential",
        connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        historyType: 0
      })
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
    expect(notificationStorage.deleteById).toBeCalledWith(id);
  });

  test("Cannot accept ACDC if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(ipexCommunicationService.admitAcdc(id)).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
    expect(submitAdmitMock).not.toBeCalled();
  });

  test("Cannot accept ACDC if identifier is not locally stored", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    notificationStorage.findById = jest.fn().mockResolvedValue({
      id,
      createdAt: new Date("2024-04-29T11:01:04.903Z"),
      a: {
        d: "saidForUuid",
      },
      linkedGroupRequest: { accepted: false },
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(ipexCommunicationService.admitAcdc(id)).rejects.toThrowError(
      IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY
    );
    expect(submitAdmitMock).not.toBeCalled();
  });
});

describe("Receive group ACDC actions", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  }); 

  test("Can begin admitting an ACDC for a group and the notification remains", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        accepted: false,
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });
    getExchangeMock.mockReturnValue(grantForIssuanceExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);
    schemaGetMock.mockResolvedValue(QVISchema);
    multisigService.getMultisigParticipants.mockResolvedValue({
      ourIdentifier: {
        id: "EGrdtLIlSIQHF1gHhE7UVfs9yRF-EDhqtLT41pJlj_z8",
        displayName: "Identifier 2",
        createdAt: "2024-09-23T08:53:11.981Z",
        theme: 0,
        groupMetadata: {
          groupId: "group-id",
          groupInitiator: true,
          groupCreated: true,
        },
      },
      multisigMembers: [
        {
          aid: "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF",
          ends: [],
        },
        {
          aid: "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
          ends: [],
        },
      ],
    });
    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);
    createExchangeMessageMock.mockResolvedValue([
      ipexSubmitAdmitSerder,
      ipexSubmitAdmitSig,
      ipexSubmitAdmitEnd,
    ]);

    (Saider.saidify as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue([{} as Saider, ipexGrantSerder.ked])
    );
    (Serder as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue({
        ked: { d: "EKJEr0WbRERI1j2GjjfuReOIHjBSjC0tXguEaNYo5Hl6" },
      })
    );

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: id,
        createdAt: DATETIME,
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequest: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: DATETIME,
      },
    ]);
    eventEmitter.emit = jest.fn();
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    ipexAdmitMock.mockResolvedValue(["admit", ["sigs"], "aend"]);

    await ipexCommunicationService.admitAcdc(id);

    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith({
      ...credentialRecordProps,
      identifierId: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      identifierType: "group",
      createdAt: new Date(credentialRecordProps.issuanceDate)
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.AcdcStateChanged,
      payload: {
        credential: {
          ...credentialRecordProps,
          identifierId: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
          identifierType: "group",
          createdAt: new Date(credentialRecordProps.issuanceDate)
        },
        status: CredentialStatus.PENDING,
      },
    });
    expect(submitAdmitMock).toBeCalledWith(
      "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      ipexSubmitAdmitSerder,
      ipexSubmitAdmitSig,
      ipexSubmitAdmitEnd,
      [
        "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF",
        "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
      ]
    );
    expect(notificationStorage.update).toBeCalledWith({ 
      type: "NotificationRecord",
      id: id,
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        "accepted": true,
        "current": "EL3A2jk9gvmVe4ROISB2iWmM8yPSNwQlmar6-SFVWSPW",
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });
    expect(signifyClient.contacts().update).toBeCalledWith("EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x", {
      [`${KeriaContactKeyPrefix.HISTORY_IPEX}EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL`]: JSON.stringify({
        id: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
        dt: "2024-07-30T04:19:55.801000+00:00",
        credentialType: "Qualified vLEI Issuer Credential",
        connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        historyType: 0
      })
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
    expect(notificationStorage.deleteById).not.toBeCalled();
  });

  test("Cannot begin admitting an ACDC twice", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        accepted: true,
        current: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR"
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });

    await expect(ipexCommunicationService.admitAcdc(id)).rejects.toThrowError(IpexCommunicationService.ACDC_ALREADY_ADMITTED);
  });

  test("Can join group admit of an ACDC", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: "id",
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        accepted: false,
        current: "EL3A2jk9gvmVe4ROISB2iWmM8yPSNwQlmar6-SFVWSPW",
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });
    getExchangeMock.mockReturnValueOnce(multisigExnAdmitForIssuance).mockReturnValueOnce(grantForIssuanceExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);
    multisigService.getMultisigParticipants.mockResolvedValue({
      ourIdentifier: {
        id: "EGrdtLIlSIQHF1gHhE7UVfs9yRF-EDhqtLT41pJlj_z8",
        displayName: "Identifier 2",
        createdAt: "2024-09-23T08:53:11.981Z",
        theme: 0,
        groupMetadata: {
          groupId: "group-id",
          groupInitiator: true,
          groupCreated: true,
        },
      },
      multisigMembers: [
        {
          aid: "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF",
          ends: [],
        },
        {
          aid: "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
          ends: [],
        },
      ],
    });
    getManagerMock.mockReturnValue({
      sign: () => [
        "ABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB",
      ],
    });
    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);
    createExchangeMessageMock.mockResolvedValue([
      ipexSubmitAdmitSerder,
      ipexSubmitAdmitSig,
      ipexSubmitAdmitEnd,
    ]);
    schemaGetMock.mockResolvedValue(QVISchema);
    ipexAdmitMock.mockResolvedValue([
      ipexAdmitSerder,
      ipexAdmitSig,
      ipexAdmitEnd,
    ]);
    eventEmitter.emit = jest.fn();
    saveOperationPendingMock.mockResolvedValueOnce({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    
    (Saider.saidify as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue([{} as Saider, ipexGrantSerder.ked])
    );
    (Serder as jest.Mock).mockImplementation(
      jest.fn().mockReturnValue({
        ked: { d: "EKJEr0WbRERI1j2GjjfuReOIHjBSjC0tXguEaNYo5Hl6" },
      })
    );

    await ipexCommunicationService.joinMultisigAdmit("id");

    expect(getManagerMock).toBeCalledWith(gHab);
    expect(submitAdmitMock).toBeCalledWith(
      "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      ipexSubmitAdmitSerder,
      ipexSubmitAdmitSig,
      ipexSubmitAdmitEnd,
      [
        "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF",
        "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
      ]
    );
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith({
      ...credentialRecordProps,
      identifierId: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      identifierType: "group",
      createdAt: new Date(credentialRecordProps.issuanceDate)
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.AcdcStateChanged,
      payload: {
        credential: {
          ...credentialRecordProps,
          identifierId: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
          identifierType: "group",
          createdAt: new Date(credentialRecordProps.issuanceDate)
        },
        status: CredentialStatus.PENDING,
      },
    });
    expect(notificationStorage.update).toBeCalledWith({ 
      type: "NotificationRecord",
      id: "id",
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        "accepted": true,
        "current": "EL3A2jk9gvmVe4ROISB2iWmM8yPSNwQlmar6-SFVWSPW",
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });
    expect(signifyClient.contacts().update).toBeCalledWith("EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x", {
      [`${KeriaContactKeyPrefix.HISTORY_IPEX}EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL`]: JSON.stringify({
        id: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
        dt: "2024-07-30T04:19:55.801000+00:00",
        credentialType: "Qualified vLEI Issuer Credential",
        connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        historyType: 0
      })
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

  test("Cannot join group admit for a grant notification that does not exist", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue(null);

    await expect(
      ipexCommunicationService.joinMultisigAdmit(id)
    ).rejects.toThrowError(IpexCommunicationService.NOTIFICATION_NOT_FOUND);
    expect(submitAdmitMock).not.toBeCalled();
  });

  test("Cannot join group admit of an ACDC if there is no current admit to join", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: "id",
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        accepted: false,
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });

    await expect(
      ipexCommunicationService.joinMultisigAdmit(id)
    ).rejects.toThrowError(IpexCommunicationService.NO_ADMIT_TO_JOIN);
    expect(submitAdmitMock).not.toBeCalled();
  });

  test("Cannot join group admit of an ACDC if group identifier is not locally stored", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: "id",
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequest: {
        accepted: false,
        current: "EL3A2jk9gvmVe4ROISB2iWmM8yPSNwQlmar6-SFVWSPW",
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });
    getExchangeMock.mockReturnValueOnce(multisigExnAdmitForIssuance).mockReturnValueOnce(grantForIssuanceExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(undefined);
    
    await expect(
      ipexCommunicationService.joinMultisigAdmit(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(submitAdmitMock).not.toBeCalled();
  });
});

describe("Receive group ACDC progress", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });

  test("Cannot get linkedGroupRequest from ipex/grant if the notification is missing in the DB", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    notificationStorage.findById.mockResolvedValueOnce(null);

    await expect(
      ipexCommunicationService.getLinkedGroupFromIpexGrant(notification.id)
    ).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test("Should return the current progress of an admit linked to a grant", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    const grantNoteRecord = {
      linkedGroupRequest: {
        accepted: true,
        current: "currentsaid"
      },
      a: { d: "d" },
    };

    notificationStorage.findById.mockResolvedValueOnce(grantNoteRecord);
    getExchangeMock.mockImplementationOnce(() => ({
      exn: { e: { acdc: { d: "credentialSaid" } }, a: { i: "i" } },
    }));

    identifiersGetMock = jest.fn().mockResolvedValueOnce({
      state: {
        kt: "2",
      },
    });

    identifiersMemberMock.mockResolvedValueOnce({
      signing: [
        {
          aid: "memberA",
        },
        {
          aid: "memberB",
        },
        {
          aid: "memberC"
        }
      ],
    });

    getRequestMock.mockResolvedValueOnce([
      { exn: { i: "memberB" }},
      { exn: { i: "memberC" }}
    ]);

    const result = await ipexCommunicationService.getLinkedGroupFromIpexGrant(
      notification.id
    );

    expect(result).toEqual({
      members: ["memberA", "memberB", "memberC"],
      threshold: "2",
      othersJoined: ["memberB", "memberC"],
      linkedGroupRequest: {
        accepted: true,
        current: "currentsaid"
      }
    });
  });

  test("Should return the defaults when there is no admit linked to a grant", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    const grantNoteRecord = {
      linkedGroupRequest: { accepted: false },
      a: { d: "d" },
    };

    identifiersMemberMock.mockResolvedValueOnce({
      signing: [
        {
          aid: "memberA",
        },
        {
          aid: "memberB",
        },
        {
          aid: "memberC"
        }
      ],
    });

    notificationStorage.findById.mockResolvedValueOnce(grantNoteRecord);
    getExchangeMock.mockImplementationOnce(() => ({
      exn: { e: { acdc: { d: "credentialSaid" } }, a: { i: "i" } },
    }));

    identifiersGetMock = jest.fn().mockResolvedValueOnce({
      state: {
        kt: "2",
      },
    });

    const result = await ipexCommunicationService.getLinkedGroupFromIpexGrant(
      notification.id
    );

    expect(result).toEqual({
      members: ["memberA", "memberB", "memberC"],
      threshold: "2",
      othersJoined: [],
      linkedGroupRequest: {
        accepted: false,
      }
    });
  });
});

// @TODO - foconnor: Split into individual describes and tidy up.
describe("IPEX communication service of agent", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });

  test("Can offer Keri Acdc when received the ipex apply", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = DATETIME;
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
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
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
    ipexSubmitOfferMock.mockResolvedValue({ name: "opName", done: true });
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

  test.skip("Can grant Keri Acdc when received the ipex agree", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = DATETIME.toISOString();
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

    const grantNoteRecord = {
      linkedGroupRequest: {},
      a: { d: "d" },
    };
    notificationStorage.findById.mockResolvedValueOnce(grantNoteRecord);
    credentialGetMock.mockResolvedValueOnce(getCredentialResponse);

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
    const date = DATETIME.toISOString();
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
    credentialGetMock.mockResolvedValueOnce(getCredentialResponse);
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

  test("Should throw error if other error occurs with grant Keri Acdc", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = DATETIME.toISOString();
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

    const grantNoteRecord = {
      linkedGroupRequest: {},
      a: { d: "d" },
    };
    notificationStorage.findById.mockResolvedValueOnce(grantNoteRecord);
    const errorMessage = new Error("Error - 500");
    credentialGetMock.mockRejectedValueOnce(errorMessage);
    await expect(
      ipexCommunicationService.grantAcdcFromAgree(noti.a.d)
    ).rejects.toThrow(errorMessage);
  });

  test("Can not grant Keri Acdc if acdc is not existed", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = DATETIME.toISOString();
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
    const error404 = new Error("Not Found - 404");
    credentialGetMock.mockRejectedValueOnce(error404);
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
    schemaGetMock.mockResolvedValue(QVISchema);
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
      identifier: "uuid",
    });
    expect(credentialListMock).toBeCalledWith({
      filter: expect.objectContaining({
        "-s": { $eq: mockExchange.exn.a.s },
        "-a-i": mockExchange.exn.rp,
      }),
    });
  });

  test("Can create linked ipex message record", async () => {
    schemaGetMock.mockResolvedValueOnce(QVISchema);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      grantForIssuanceExnMessage,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );

    expect(updateContactMock).toBeCalledWith(grantForIssuanceExnMessage.exn.i, {
      [`${KeriaContactKeyPrefix.HISTORY_IPEX}${grantForIssuanceExnMessage.exn.d}`]:
        JSON.stringify({
          id: grantForIssuanceExnMessage.exn.d,
          dt: grantForIssuanceExnMessage.exn.dt,
          credentialType: QVISchema.title,
          connectionId: grantForIssuanceExnMessage.exn.i,
          historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
        }),
    });

    schemaGetMock.mockResolvedValueOnce(QVISchema);
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
      grantForIssuanceExnMessage,
      ConnectionHistoryType.CREDENTIAL_PRESENTED
    );
    expect(updateContactMock).toBeCalledWith(
      grantForIssuanceExnMessage.exn.rp,
      {
        [`${KeriaContactKeyPrefix.HISTORY_IPEX}${grantForIssuanceExnMessage.exn.d}`]:
          JSON.stringify({
            id: grantForIssuanceExnMessage.exn.d,
            dt: grantForIssuanceExnMessage.exn.dt,
            credentialType: QVISchema.title,
            connectionId: grantForIssuanceExnMessage.exn.rp,
            historyType: ConnectionHistoryType.CREDENTIAL_PRESENTED,
          }),
      }
    );

    expect(schemaGetMock).toBeCalledTimes(2);
    expect(connections.resolveOobi).toBeCalledTimes(2);
  });

  test("Can create linked ipex message record with message exchange route ipex/apply", async () => {
    schemaGetMock.mockResolvedValueOnce(QVISchema);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      applyForPresentingExnMessage,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );
    expect(updateContactMock).toBeCalledWith(
      applyForPresentingExnMessage.exn.i,
      {
        [`${KeriaContactKeyPrefix.HISTORY_IPEX}${applyForPresentingExnMessage.exn.d}`]:
          JSON.stringify({
            id: applyForPresentingExnMessage.exn.d,
            dt: applyForPresentingExnMessage.exn.dt,
            credentialType: QVISchema.title,
            connectionId: applyForPresentingExnMessage.exn.i,
            historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
          }),
      }
    );
    expect(schemaGetMock).toBeCalledTimes(1);
    expect(connections.resolveOobi).toBeCalledTimes(1);
  });

  test("can link credential presentation history items to the correct connection", async () => {
    schemaGetMock.mockResolvedValueOnce(QVISchema);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      grantForIssuanceExnMessage,
      ConnectionHistoryType.CREDENTIAL_PRESENTED
    );
    expect(updateContactMock).toBeCalledWith(
      grantForIssuanceExnMessage.exn.rp,
      {
        [`${KeriaContactKeyPrefix.HISTORY_IPEX}${grantForIssuanceExnMessage.exn.d}`]:
          JSON.stringify({
            id: grantForIssuanceExnMessage.exn.d,
            dt: grantForIssuanceExnMessage.exn.dt,
            credentialType: QVISchema.title,
            connectionId: grantForIssuanceExnMessage.exn.rp,
            historyType: ConnectionHistoryType.CREDENTIAL_PRESENTED,
          }),
      }
    );
    expect(schemaGetMock).toBeCalledTimes(1);
    expect(connections.resolveOobi).toBeCalledTimes(1);
  });

  test("Can create linked ipex message record with message exchange route ipex/agree", async () => {
    schemaGetMock.mockResolvedValueOnce(QVISchema);
    getExchangeMock.mockResolvedValueOnce(agreeForPresentingExnMessage);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      agreeForPresentingExnMessage,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );

    expect(updateContactMock).toBeCalledWith(
      agreeForPresentingExnMessage.exn.i,
      {
        [`${KeriaContactKeyPrefix.HISTORY_IPEX}${agreeForPresentingExnMessage.exn.d}`]:
          JSON.stringify({
            id: agreeForPresentingExnMessage.exn.d,
            dt: agreeForPresentingExnMessage.exn.dt,
            credentialType: QVISchema.title,
            connectionId: agreeForPresentingExnMessage.exn.i,
            historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
          }),
      }
    );
    expect(schemaGetMock).toBeCalledTimes(1);
    expect(connections.resolveOobi).toBeCalledTimes(1);
  });

  test("Can create linked ipex message record with history type is credential revoked", async () => {
    schemaGetMock.mockResolvedValueOnce(QVISchema);
    getExchangeMock.mockResolvedValueOnce(agreeForPresentingExnMessage);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      agreeForPresentingExnMessage,
      ConnectionHistoryType.CREDENTIAL_REVOKED
    );

    expect(updateContactMock).toBeCalledWith(
      agreeForPresentingExnMessage.exn.i,
      {
        [`${KeriaContactKeyPrefix.HISTORY_REVOKE}${agreeForPresentingExnMessage.exn.e.acdc.d}`]:
          JSON.stringify({
            id: agreeForPresentingExnMessage.exn.d,
            dt: agreeForPresentingExnMessage.exn.dt,
            credentialType: QVISchema.title,
            connectionId: agreeForPresentingExnMessage.exn.i,
            historyType: ConnectionHistoryType.CREDENTIAL_REVOKED,
          }),
      }
    );
    expect(schemaGetMock).toBeCalledTimes(1);
    expect(connections.resolveOobi).toBeCalledTimes(1);
  });

  test("Should throw error if history type invalid", async () => {
    schemaGetMock.mockResolvedValueOnce(QVISchema);
    getExchangeMock.mockResolvedValueOnce(agreeForPresentingExnMessage);
    await expect(
      ipexCommunicationService.createLinkedIpexMessageRecord(
        agreeForPresentingExnMessage,
        "invalid" as any
      )
    ).rejects.toThrowError("Invalid history type");
  });

  test("Should throw error if schemas.get has an unexpected error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    schemaGetMock.mockRejectedValueOnce(new Error("Unknown error"));
    await expect(
      ipexCommunicationService.createLinkedIpexMessageRecord(
        grantForIssuanceExnMessage,
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
      ipexCommunicationService.admitAcdc("id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    const noti = {
      id: "id",
      createdAt: DATETIME.toISOString(),
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

  test("Cannot get ipex apply details if the schema cannot be located", async () => {
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

  test("Should throw error for non-404 errors - getIpexApplyDetails", async () => {
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

  test("Cannot get linkedGroupRequest from ipex/apply if the notification is missing in the DB", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    notificationStorage.findById.mockResolvedValueOnce(null);

    await expect(
      ipexCommunicationService.getLinkedGroupFromIpexApply(notification.id)
    ).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test.skip("Should return accepted and membersJoined with each credential when linkedGroupRequest from ipex/apply contain valid data", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    const applyNoteRecord = {
      linkedGroupRequest: {
        credentialSaid1: {
          accepted: true,
          saids: {
            ipexOfferSaid1: [
              ["memberA", "multisigExn1A"],
              ["memberB", "multisigExn1B"],
            ],
            ipexOfferSaid2: [["memberA", "multisigExn2A"]],
          },
        },
        credentialSaid2: {
          accepted: true,
          saids: {
            ipexOfferSaid1: [["memberC", "multisigExn1C"]],
            ipexOfferSaid2: [["memberD", "multisigExn2C"]],
          },
        },
      },
      a: { d: "d" },
    };

    notificationStorage.findById.mockResolvedValueOnce(applyNoteRecord);

    getExchangeMock.mockImplementationOnce(() => ({
      exn: { a: { i: "i" } },
    }));

    identifiersGetMock = jest.fn().mockResolvedValueOnce({
      state: {
        kt: "2",
      },
    });

    identifiersMemberMock.mockResolvedValueOnce({
      signing: [
        {
          aid: "memberA",
        },
        {
          aid: "memberB",
        },
        {
          aid: "memberC",
        },
        {
          aid: "memberD",
        },
      ],
    });

    const result = await ipexCommunicationService.getLinkedGroupFromIpexApply(
      notification.id
    );

    expect(result).toEqual({
      members: ["memberA", "memberB", "memberC", "memberD"],
      threshold: "2",
      offer: {
        credentialSaid1: {
          accepted: true,
          membersJoined: ["memberA", "memberB"],
        },
        credentialSaid2: {
          accepted: true,
          membersJoined: ["memberC", "memberD"],
        },
      },
    });
  });

  test.skip("Should return accepted is False and membersJoined with each credential when linkedGroupRequest from ipex/apply not available", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    const applyNoteRecord = {
      linkedGroupRequest: {
        credentialSaid1: {
          accepted: false,
          saids: {},
        },
        credentialSaid2: {
          accepted: false,
          saids: {},
        },
      },
      a: { d: "d" },
    };

    getExchangeMock.mockImplementationOnce(() => ({
      exn: { a: { i: "i" } },
    }));

    identifiersGetMock = jest.fn().mockResolvedValueOnce({
      state: {
        kt: "2",
      },
    });

    identifiersMemberMock.mockResolvedValueOnce({
      signing: [
        {
          aid: "memberA",
        },
        {
          aid: "memberB",
        },
        {
          aid: "memberC",
        },
        {
          aid: "memberD",
        },
      ],
    });

    notificationStorage.findById.mockResolvedValueOnce(applyNoteRecord);
    const result = await ipexCommunicationService.getLinkedGroupFromIpexApply(
      notification.id
    );

    expect(result).toEqual({
      members: ["memberA", "memberB", "memberC", "memberD"],
      threshold: "2",
      offer: {
        credentialSaid1: {
          accepted: false,
          membersJoined: [],
        },
        credentialSaid2: {
          accepted: false,
          membersJoined: [],
        },
      },
    });
  });

  test("Should return empty object when linkedGroupRequest from ipex/apply is empty", async () => {
    const id = "uuid";
    const date = DATETIME.toISOString();
    const notification = {
      id,
      createdAt: date,
      a: {
        d: "d",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };

    const applyNoteRecord = {
      linkedGroupRequest: {},
      a: { d: "d" },
    };

    getExchangeMock.mockImplementationOnce(() => ({
      exn: { a: { i: "i" } },
    }));

    identifiersGetMock = jest.fn().mockResolvedValueOnce({
      state: {
        kt: "2",
      },
    });

    identifiersMemberMock.mockResolvedValueOnce({
      signing: [
        {
          aid: "memberA",
        },
        {
          aid: "memberB",
        },
      ],
    });

    notificationStorage.findById.mockResolvedValueOnce(applyNoteRecord);
    const result = await ipexCommunicationService.getLinkedGroupFromIpexApply(
      notification.id
    );

    expect(result).toEqual({
      members: ["memberA", "memberB"],
      threshold: "2",
      offer: {},
    });
  });

  test.skip("Can join offer ACDC from multisig exn", async () => {
    eventEmitter.emit = jest.fn();
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    getExchangeMock.mockReturnValueOnce(multisigExnOfferForPresenting);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);

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
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test.skip("Can join grant ACDC from multisig exn", async () => {
    eventEmitter.emit = jest.fn();
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexAgree,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    getExchangeMock.mockReturnValueOnce(multisigExnGrant);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);

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
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexAgree,
      read: true,
      linkedGroupRequest: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test("Cannot join offer ACDC from multisig exn if identifier is not locally stored", async () => {
    const id = "uuid";
    getExchangeMock.mockReturnValueOnce(multisigExnGrant);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(
      ipexCommunicationService.joinMultisigOffer(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(deleteNotificationMock).not.toBeCalledWith(id);
  });

  test.skip("Cannot join grant ACDC from multisig exn if identifier is not locally stored", async () => {
    const id = "uuid";
    getExchangeMock.mockReturnValueOnce(multisigExnGrant);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(
      ipexCommunicationService.joinMultisigGrant(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(deleteNotificationMock).not.toBeCalledWith(id);
  });

  test.skip("Should join multisig offer if linkedGroupRequestDetails exists and is not accepted", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "id";
    const applyNoteRecord = {
      linkedGroupRequest: {
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
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    eventEmitter.emit = jest.fn();
    notificationStorage.findById.mockResolvedValueOnce(applyNoteRecord);
    getExchangeMock.mockReturnValueOnce(multisigExnOfferForPresenting);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(groupIdentifierMetadataRecord);

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

    await ipexCommunicationService.offerAcdcFromApply(id, credentialRecord);

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
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test.skip("Should return early if linkedGroupRequestDetails is accepted", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "id";
    const applyNoteRecord = {
      linkedGroupRequest: {
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

    await ipexCommunicationService.offerAcdcFromApply(id, credentialRecord);

    expect(ipexCommunicationService.joinMultisigOffer).not.toHaveBeenCalled();
  });

  test.skip("Can offer ACDC from multisig exn", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";
    eventEmitter.emit = jest.fn();

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: id,
      createdAt: DATETIME,
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: DATETIME,
    });

    getExchangeMock.mockReturnValueOnce(multisigExnOfferForPresenting);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(groupIdentifierMetadataRecord);

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
        createdAt: DATETIME,
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedGroupRequest: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: DATETIME,
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

    await ipexCommunicationService.offerAcdcFromApply(id, credentialRecord);

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

  test.skip("Can offer ACDC and update linkedGroupRequest when FIRST of multisig joins", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    eventEmitter.emit = jest.fn();

    notificationStorage.findById = jest.fn().mockResolvedValue({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });

    getExchangeMock.mockReturnValueOnce(applyForPresentingExnMessage);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);

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

    await ipexCommunicationService.offerAcdcFromApply("id", credentialRecord);

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {
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

  test.skip("Can offer ACDC from multisig exn and update linkedGroupRequest when SECOND of multisig joins", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const notificationRecord = {
      type: "NotificationRecord",
      id: "id",
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {},
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };

    notificationStorage.findById = jest
      .fn()
      .mockResolvedValue(notificationRecord);

    getExchangeMock.mockReturnValueOnce(multisigExnOfferForPresenting);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);

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

    await ipexCommunicationService.offerAcdcFromApply("id", credentialRecord);

    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });

    expect(notificationStorage.update).lastCalledWith({
      type: "NotificationRecord",
      id: "id",
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequest: {
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

  test.skip("Can initiate offering an ACDC from a multi-sig identifier", async () => {
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

  test.skip("Can agree to offer an ACDC with a multi-sig identifier", async () => {
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

    getManagerMock.mockResolvedValue({
      sign: () => [
        "ABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB",
      ],
    });
    createExchangeMessageMock.mockResolvedValueOnce([
      ipexSubmitOfferSerder,
      ipexSubmitOfferSig,
      ipexSubmitOfferEnd,
    ]);

    getManagerMock.mockImplementationOnce(() => {
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
      NotificationRoute.MultiSigExn,
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

  test.skip("Should join multisig agree if linkedGroupRequestDetails exists and is not accepted", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "id";
    const agreeNoteRecord = {
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      linkedGroupRequest: {
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
      .mockReturnValueOnce(agreeForPresentingExnMessage)
      .mockReturnValueOnce(offerForPresentingExnMessage);

    await ipexCommunicationService.grantAcdcFromAgree(id);

    expect(ipexCommunicationService.joinMultisigGrant).toHaveBeenCalledWith(
      "exnSaid"
    );
    expect(notificationStorage.update).not.toHaveBeenCalled();
  });

  test.skip("Can initiate granting an ACDC from a multi-sig identifier", async () => {
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

  test.skip("Can agree to grant an ACDC with a multi-sig identifier", async () => {
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

    getManagerMock.mockResolvedValue({
      sign: () => [
        "ABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB",
      ],
    });
    createExchangeMessageMock.mockResolvedValueOnce([
      ipexSubmitGrantSerder,
      ipexSubmitGrantSig,
      ipexSubmitGrantEnd,
    ]);

    getManagerMock.mockImplementationOnce(() => {
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
      NotificationRoute.MultiSigExn,
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

  test.skip("Can join grant present credential with multisig exn", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);

    const id = "id";
    const agreeNoteRecord = {
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      linkedGroupRequest: {},
    };

    notificationStorage.findById.mockResolvedValueOnce(agreeNoteRecord);
    getExchangeMock
      .mockReturnValueOnce(agreeForPresentingExnMessage)
      .mockReturnValueOnce(offerForPresentingExnMessage);
    credentialGetMock.mockResolvedValueOnce(getCredentialResponse);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(groupIdentifierMetadataRecord);

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
      linkedGroupRequest: {
        "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli": {
          accepted: true,
          saids: {
            ipexGrantSaid: [["member", "exnSaid"]],
          },
        },
      },
    });
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
    getExchangeMock.mockReturnValueOnce(grantForIssuanceExnMessage);
    schemaGetMock.mockResolvedValue(QVISchema);
    credentialStateMock.mockResolvedValueOnce(credentialStateIssued);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(memberIdentifierRecord);

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
      s: QVISchema,
      lastStatus: { s: "0", dt: "2024-11-07T08:32:34.943Z" },
      status: "pending",
      identifierId: memberIdentifierRecord.id,
    });
  });

  test("Can get acdc detail when the schema has not been resolved", async () => {
    getExchangeMock.mockReturnValueOnce(grantForIssuanceExnMessage);
    credentialStateMock.mockResolvedValueOnce(credentialStateIssued);
    const error404 = new Error("Not Found - 404");
    schemaGetMock.mockRejectedValueOnce(error404);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(memberIdentifierRecord);

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
      s: QVISchema,
      lastStatus: { s: "0", dt: "2024-11-07T08:32:34.943Z" },
      status: "pending",
      identifierId: memberIdentifierRecord.id,
    });
    expect(connections.resolveOobi).toBeCalledWith("http://cred-issuance:3001/oobi/EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu");
  });

  test("Throws error if the schema has not been resolved and with a non-404 error - getAcdcFromIpexGrant", async () => {
    getExchangeMock.mockReturnValueOnce(grantForIssuanceExnMessage);
    const error = new Error("Some other error - 500");
    schemaGetMock.mockRejectedValueOnce(error);

    await expect(
      ipexCommunicationService.getAcdcFromIpexGrant("said")
    ).rejects.toThrow("Some other error - 500");
    expect(schemaGetMock).toHaveBeenCalledTimes(1);
    expect(connections.resolveOobi).not.toHaveBeenCalled();
  });

  test("Should return last status is revoked when getting credential state from cloud", async () => {
    getExchangeMock.mockReturnValueOnce(grantForIssuanceExnMessage);
    schemaGetMock.mockResolvedValue(QVISchema);
    credentialStateMock.mockResolvedValueOnce(credentialStateRevoked);

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(memberIdentifierRecord);

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
      s: QVISchema,
      lastStatus: { s: "1", dt: "2024-11-07T08:32:34.943Z" },
      status: "pending",
      identifierId: memberIdentifierRecord.id,
    });
  });
});
