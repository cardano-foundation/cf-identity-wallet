import { Agent } from "../agent";
import {
  ConnectionStatus,
  ExchangeRoute,
  MiscRecordId,
  NotificationRoute,
} from "../agent.types";
import { IdentifierStorage, NotificationStorage } from "../records";
import { OperationPendingRecord } from "../records/operationPendingRecord";
import { CredentialStatus } from "./credentialService.types";
import { CoreEventEmitter } from "../event";
import { KeriaNotificationService } from "./keriaNotificationService";
import { EventTypes } from "../event.types";
import { deleteNotificationRecordById } from "./utils";
import {
  credentialMetadataMock,
  getCredentialResponse,
  multisigExnGrant,
  multisigExnAdmitForIssuance,
  multisigExnOfferForPresenting,
  multisigExnApplyForPresenting,
  notificationMultisigRpyProp,
  notificationMultisigExnProp,
  notificationMultisigIcpProp,
  notificationIpexGrantProp,
  notificationIpexApplyProp,
  grantForIssuanceExnMessage,
  applyForPresentingExnMessage,
  agreeForPresentingExnMessage,
  credentialStateIssued,
  notificationIpexOfferProp,
} from "../../__fixtures__/agent/keriaNotificationFixture";
import { ConnectionHistoryType } from "./connectionService.types";

const identifiersListMock = jest.fn();
const identifiersGetMock = jest.fn();
const identifiersCreateMock = jest.fn();
const identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const groupGetRequestMock = jest.fn();

const oobiResolveMock = jest.fn();
const queryKeyStateMock = jest.fn();
const markNotificationMock = jest.fn();
const getCredentialMock = jest.fn();
const credentialStateMock = jest.fn();
const admitMock = jest.fn();
const submitAdmitMock = jest.fn();
const listNotificationsMock = jest.fn();
const operationsGetMock = jest.fn().mockImplementation((id: string) => {
  return {
    done: true,
    response: {
      i: id,
    },
  };
});

jest.mock("signify-ts", () => ({
  Salter: jest.fn().mockImplementation(() => {
    return { qb64: "" };
  }),
  Ilks: {
    rev: "rev",
  },
}));
const contactsUpdateMock = jest.fn();
const contactGetMock = jest.fn();
const contactDeleteMock = jest.fn();
const exchangesGetMock = jest.fn();
const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: jest.fn(),
    interact: identifiersInteractMock,
    rotate: identifiersRotateMock,
    members: identifiersMemberMock,
  }),
  operations: () => ({
    get: operationsGetMock,
  }),
  oobis: () => ({
    get: jest.fn(),
    resolve: oobiResolveMock,
  }),
  contacts: () => ({
    list: jest.fn(),
    get: contactGetMock,
    delete: contactDeleteMock,
    update: contactsUpdateMock,
  }),
  notifications: () => ({
    list: listNotificationsMock,
    mark: markNotificationMock,
  }),
  ipex: () => ({
    admit: admitMock,
    submitAdmit: submitAdmitMock,
  }),
  credentials: () => ({
    get: getCredentialMock,
    list: jest.fn(),
    state: credentialStateMock,
  }),
  exchanges: () => ({
    get: exchangesGetMock,
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: queryKeyStateMock,
    get: jest.fn(),
  }),
  groups: () => ({
    getRequest: groupGetRequestMock,
  }),
  schemas: () => ({
    get: jest.fn().mockResolvedValue({
      title: "IIW 2024 Demo Day Attendee",
    }),
  }),
});

const eventEmitter = new CoreEventEmitter();

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter: eventEmitter,
};

const identifierMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  createdAt: new Date(),
  theme: 0,
};

const notificationStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const connectionStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
});

const getIpexMessageMetadataMock = jest.fn();

const operationPendingGetAllMock = jest.fn();
const operationPendingStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: operationPendingGetAllMock,
});

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
  getCredentialMetadatasById: jest.fn(),
});

const basicStorage = jest.mocked({
  findById: jest.fn(),
  save: jest.fn(),
  createOrUpdateBasicRecord: jest.fn(),
});

const multiSigs = jest.mocked({
  joinAuthorization: jest.fn(),
  hasMultisig: jest.fn(),
  endRoleAuthorization: jest.fn(),
});

const ipexCommunications = jest.mocked({
  createLinkedIpexMessageRecord: jest.fn(),
  acceptAcdcFromMultisigExn: jest.fn(),
  grantAcdcFromAgree: jest.fn(),
  joinMultisigOffer: jest.fn(),
  joinMultisigGrant: jest.fn(),
});

const credentialService = jest.mocked({
  markAcdc: jest.fn(),
});

const keriaNotificationService = new KeriaNotificationService(
  agentServicesProps,
  notificationStorage as any,
  identifierStorage as any,
  operationPendingStorage as any,
  connectionStorage as any,
  credentialStorage as any,
  basicStorage as any,
  multiSigs as any,
  ipexCommunications as any,
  credentialService as any,
  Agent.agent.getKeriaOnlineStatus,
  Agent.agent.markAgentStatus,
  Agent.agent.connect
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
      markAgentStatus: jest.fn(),
      connect: jest.fn(),
      multiSigs: {
        hasMultisig: jest.fn(),
        joinAuthorization: jest.fn(),
        endRoleAuthorization: jest.fn(),
      },
      ipexCommunications: {
        grantAcdcFromAgree: jest.fn(),
        createLinkedIpexMessageRecord: jest.fn(),
        acceptAcdcFromMultisigExn: jest.fn(),
        markAcdc: jest.fn(),
      },
      keriaNotifications: {
        markAcdcComplete: jest.fn(),
      },
      identifiers: {
        getIdentifier: jest.fn(),
      },
    },
  },
}));

eventEmitter.emit = jest.fn();
eventEmitter.on = jest.fn();

describe("Signify notification service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("emit new event for new notification", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce(credentialStateIssued);
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [
      notificationMultisigIcpProp,
      notificationIpexGrantProp,
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "unknown",
          d: "string",
          m: "",
        },
      },
    ];
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce(null);
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({});
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "0AC0W27tnnd2WyHWUh-368EI",
      createdAt: new Date("2024-09-20T02:51:24.930Z"),
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EBcuMc13wJx0wbmxdWqqjoD5V_c532dg2sO-fvISrrMH",
        m: "",
      },
      connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
      read: false,
    });

    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);
    jest.useFakeTimers();
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(notificationStorage.save).toBeCalledTimes(1);
    expect(eventEmitter.emit).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationAdded,
      payload: {
        keriaNotif: {
          a: {
            d: "EBcuMc13wJx0wbmxdWqqjoD5V_c532dg2sO-fvISrrMH",
            m: "",
            r: NotificationRoute.ExnIpexGrant,
          },
          connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
          createdAt: "2024-09-20T02:51:24.930Z",
          id: "0AC0W27tnnd2WyHWUh-368EI",
          multisigId: undefined,
          read: false,
        },
      },
    });
  });

  test("Should admit if there is an existing credential", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "rev",
    });
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [notificationIpexGrantProp];
    credentialStorage.getCredentialMetadata.mockResolvedValue(
      credentialMetadataMock
    );
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);
    jest.useFakeTimers();
    admitMock.mockResolvedValue([{}, ["sigs"], "end"]);
    submitAdmitMock.mockResolvedValueOnce({
      name: "name",
      done: true,
    });
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(admitMock).toBeCalledTimes(1);
    expect(submitAdmitMock).toBeCalledTimes(1);
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(credentialService.markAcdc).toBeCalledWith(
      grantForIssuanceExnMessage.exn.e.acdc.d,
      CredentialStatus.REVOKED
    );
  });

  test("Should call update when read a notification", async () => {
    const notification = {
      id: "id",
      read: false,
    };

    notificationStorage.findById = jest.fn().mockResolvedValue(notification);
    await keriaNotificationService.readNotification(notification.id);
    expect(notificationStorage.update).toBeCalledTimes(1);
  });

  test("Should throw error when read an invalid notification", async () => {
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(
      keriaNotificationService.readNotification("not-exist-noti-id")
    ).rejects.toThrowError(KeriaNotificationService.NOTIFICATION_NOT_FOUND);
  });

  test("should call delete keri notification when trigger deleteNotificationRecordById", async () => {
    const id = "uuid";
    await keriaNotificationService.deleteNotificationRecordById(
      id,
      NotificationRoute.ExnIpexAgree
    );

    expect(notificationStorage.deleteById).toBeCalledWith(id);
    expect(markNotificationMock).toBeCalledWith(id);
  });

  test("can delete keri notification by ID", async () => {
    const id = "uuid";
    const notificationStorage = new NotificationStorage(
      agentServicesProps.signifyClient
    );
    notificationStorage.deleteById = jest.fn();
    await deleteNotificationRecordById(
      agentServicesProps.signifyClient,
      notificationStorage,
      id,
      NotificationRoute.ExnIpexGrant
    );
    expect(notificationStorage.deleteById).toBeCalledWith(id);
    expect(markNotificationMock).toBeCalledWith(id);
  });

  test("Should not mark local notification when we delete notification", async () => {
    const id = "uuid";
    const notificationStorage = new NotificationStorage(
      agentServicesProps.signifyClient
    );
    notificationStorage.deleteById = jest.fn();
    await deleteNotificationRecordById(
      agentServicesProps.signifyClient,
      notificationStorage,
      id,
      NotificationRoute.LocalAcdcRevoked
    );
    expect(notificationStorage.deleteById).toBeCalledWith(id);
    expect(markNotificationMock).not.toBeCalled();
  });

  test("Should skip if there is no valid multi-sig notification", async () => {
    exchangesGetMock
      .mockResolvedValueOnce({
        exn: {
          r: NotificationRoute.MultiSigIcp,
          p: "p",
          a: { i: "i" },
          e: {},
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: NotificationRoute.MultiSigRpy,
          p: "p",
          a: { i: "i" },
          e: {},
        },
      });
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );
    groupGetRequestMock.mockResolvedValue([]);
    const notes = [notificationMultisigIcpProp, notificationMultisigRpyProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should skip if there is a existed multi-sig", async () => {
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigIcp,
        p: "p",
        a: { i: "i" },
        e: {},
      },
    });
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(true);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);
    const notes = [notificationMultisigIcpProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should skip if there is a missing gid multi-sig notification", async () => {
    exchangesGetMock
      .mockResolvedValueOnce({
        exn: {
          r: NotificationRoute.MultiSigIcp,
          p: "p",
          a: { i: "i" },
          e: {},
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: NotificationRoute.MultiSigRpy,
          p: "p",
          a: { i: "i" },
          e: {},
        },
      });
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(true);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    groupGetRequestMock.mockResolvedValue([{ exn: { a: {} } }]);
    const notes = [notificationMultisigIcpProp, notificationMultisigRpyProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should call update when unread a notification", async () => {
    const notification = {
      id: "id",
      read: true,
    };

    notificationStorage.findById = jest.fn().mockResolvedValue(notification);
    await keriaNotificationService.unreadNotification(notification.id);
    expect(notificationStorage.update).toBeCalledTimes(1);
  });

  test("Should throw error when unread an invalid notification", async () => {
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(
      keriaNotificationService.unreadNotification("not-exist-noti-id")
    ).rejects.toThrowError(KeriaNotificationService.NOTIFICATION_NOT_FOUND);
  });

  test("Should skip if there is a missing multi-sig identifier", async () => {
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigRpy,
        p: "p",
        a: { i: "i" },
        e: {},
      },
    });
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    groupGetRequestMock.mockResolvedValue([{ exn: { a: {} } }]);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({});
    const notes = [notificationMultisigRpyProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should skip if notification route is /multisig/rpy", async () => {
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigRpy,
        p: "p",
        a: { i: "i", gid: "gid" },
        e: {
          rpy: {
            r: "/end/role/add",
          },
        },
      },
    });

    const multisigNotificationExn = {
      exn: {
        a: {
          gid: "uuid",
        },
        e: {
          rpy: {
            v: "KERI10JSON000111_",
            t: "rpy",
            d: "uuid",
            dt: "2024-07-12T09:37:48.801000+00:00",
            r: "/end/role/add",
            a: {
              cid: "uuid",
              role: "agent",
              eid: "new-uuid",
            },
          },
          d: "uuid",
        },
      },
    };

    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);
    groupGetRequestMock.mockResolvedValue([multisigNotificationExn]);

    const notes = [notificationMultisigRpyProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledWith(notes[0].i);
    expect(multiSigs.joinAuthorization).toBeCalledTimes(1);
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REQUEST_PRESENT", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });

    await keriaNotificationService.processNotification(
      notificationIpexApplyProp
    );
    expect(
      ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      grantForIssuanceExnMessage,
      ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
    );
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REVOKED", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "rev",
    });
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    credentialStorage.getCredentialMetadata.mockResolvedValue(
      credentialMetadataMock
    );
    admitMock.mockResolvedValue([{}, ["sigs"], "end"]);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    submitAdmitMock.mockResolvedValueOnce({
      name: "name",
      done: true,
    });

    await keriaNotificationService.processNotification(
      notificationIpexGrantProp
    );
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should call createLinkedIpexMessageRecord with TEL status is revoke and credential exist in cloud", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "rev",
    });
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    credentialStorage.getCredentialMetadata.mockResolvedValue(
      credentialMetadataMock
    );
    admitMock.mockResolvedValue([{}, ["sigs"], "end"]);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    submitAdmitMock.mockResolvedValueOnce({
      name: "name",
      done: true,
    });

    await keriaNotificationService.processNotification(
      notificationIpexGrantProp
    );
    expect(credentialService.markAcdc).toBeCalledWith(
      grantForIssuanceExnMessage.exn.e.acdc.d,
      CredentialStatus.REVOKED
    );
    expect(ipexCommunications.createLinkedIpexMessageRecord).toBeCalledWith(
      grantForIssuanceExnMessage,
      ConnectionHistoryType.CREDENTIAL_REVOKED
    );
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationAdded,
      payload: {
        keriaNotif: {
          id: "id",
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
          ),
          a: {
            r: NotificationRoute.LocalAcdcRevoked,
            credentialId: credentialMetadataMock.id,
            credentialTitle: credentialMetadataMock.credentialType,
          },
          read: false,
          connectionId: grantForIssuanceExnMessage.exn.i,
        },
      },
    });
  });

  test("Should skip if notification route is /multisig/exn and `e.exn.r` is not ipex/admit, ipex/offer, ipex/grant", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [notificationMultisigExnProp];

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnApplyForPresenting)
      .mockResolvedValueOnce({ exn: { d: "d" } });

    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );

    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should skip if notification route is /multisig/exn and the identifier is missing ", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);

    const notes = [notificationMultisigExnProp];

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnApplyForPresenting)
      .mockResolvedValueOnce({ exn: { d: "d" } });

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({});

    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should skip if notification route is /multisig/exn and the credential exists ", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [notificationMultisigExnProp];

    getCredentialMock.mockResolvedValue(getCredentialResponse);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnApplyForPresenting)
      .mockResolvedValueOnce({ exn: { d: "d" } });

    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );

    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Original grant is linked to first received /multisig/exn admit message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );

    getCredentialMock.mockResolvedValue(undefined);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date(),
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {},
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date(),
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: false,
          saids: {
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Auto-joins /multisig/exn admit message and links to grant if we have joined a previous but different admit message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );

    getCredentialMock.mockResolvedValue(undefined);
    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {
          "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
            accepted: true,
            saids: {
              EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H: [
                [
                  "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                  "ELlGAQaGU9yjcvsh2elQoWlxz3-cPBqIdf9u2T5OSIPL",
                ],
              ],
            },
          },
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: dt,
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(ipexCommunications.acceptAcdcFromMultisigExn).toBeCalledWith(
      "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO"
    );
    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: true,
          saids: {
            EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELlGAQaGU9yjcvsh2elQoWlxz3-cPBqIdf9u2T5OSIPL",
              ],
            ],
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: dt,
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Links /multisig/exn admit message to grant but does not join if admit by SAID already joined, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    getCredentialMock.mockResolvedValue(undefined);
    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {
          "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
            accepted: true,
            saids: {
              EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
                [
                  "EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H",
                  "EFUFE140pcdemyv5DZM3AuIuI_ye5Kd5dytdeIwpaVS1",
                ],
              ],
            },
          },
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: dt,
      },
    ]);

    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      id: "id",
    });

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(ipexCommunications.acceptAcdcFromMultisigExn).not.toBeCalled();

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: true,
      linkedGroupRequests: {
        "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W": {
          accepted: true,
          saids: {
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H",
                "EFUFE140pcdemyv5DZM3AuIuI_ye5Kd5dytdeIwpaVS1",
              ],
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: dt,
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Original apply is linked to first received /multisig/exn offer message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnOfferForPresenting)
      .mockResolvedValueOnce(applyForPresentingExnMessage);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date("2024-04-29T11:01:04.903Z"),
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedGroupRequests: {},
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date("2024-04-29T11:01:04.903Z"),
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date("2024-04-29T11:01:04.903Z"),
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: false,
          saids: {
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date("2024-04-29T11:01:04.903Z"),
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Auto-joins /multisig/exn offer message and links to apply if we have joined a previous but different offer message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnOfferForPresenting)
      .mockResolvedValueOnce(applyForPresentingExnMessage);

    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedGroupRequests: {
          EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
            accepted: true,
            saids: {
              EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H: [
                [
                  "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                  "ELlGAQaGU9yjcvsh2elQoWlxz3-cPBqIdf9u2T5OSIPL",
                ],
              ],
            },
          },
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: dt,
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(ipexCommunications.joinMultisigOffer).toBeCalledWith(
      "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO"
    );
    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELlGAQaGU9yjcvsh2elQoWlxz3-cPBqIdf9u2T5OSIPL",
              ],
            ],
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: dt,
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Links /multisig/exn offer message to apply but does not join if offer by SAID already joined, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnOfferForPresenting)
      .mockResolvedValueOnce(applyForPresentingExnMessage);

    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedGroupRequests: {
          EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
            accepted: true,
            saids: {
              EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
                [
                  "EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H",
                  "EFUFE140pcdemyv5DZM3AuIuI_ye5Kd5dytdeIwpaVS1",
                ],
              ],
            },
          },
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: dt,
      },
    ]);

    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      id: "id",
    });

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(ipexCommunications.joinMultisigOffer).not.toBeCalled();

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexApply,
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H",
                "EFUFE140pcdemyv5DZM3AuIuI_ye5Kd5dytdeIwpaVS1",
              ],
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: dt,
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Original agree is linked to first received /multisig/exn grant message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnGrant)
      .mockResolvedValueOnce(agreeForPresentingExnMessage);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date("2024-04-29T11:01:04.903Z"),
        a: {
          r: NotificationRoute.ExnIpexAgree,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexAgree,
        read: true,
        linkedGroupRequests: {},
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date("2024-04-29T11:01:04.903Z"),
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date("2024-04-29T11:01:04.903Z"),
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexAgree,
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: false,
          saids: {
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date("2024-04-29T11:01:04.903Z"),
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Auto-joins /multisig/exn grant message and links to agree if we have joined a previous but different grant message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnGrant)
      .mockResolvedValueOnce(agreeForPresentingExnMessage);

    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
        a: {
          r: NotificationRoute.ExnIpexAgree,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexAgree,
        read: true,
        linkedGroupRequests: {
          EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
            accepted: true,
            saids: {
              EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H: [
                [
                  "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                  "ELlGAQaGU9yjcvsh2elQoWlxz3-cPBqIdf9u2T5OSIPL",
                ],
              ],
            },
          },
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: dt,
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(ipexCommunications.joinMultisigGrant).toBeCalledWith(
      "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO"
    );
    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexAgree,
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELlGAQaGU9yjcvsh2elQoWlxz3-cPBqIdf9u2T5OSIPL",
              ],
            ],
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: dt,
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Links /multisig/exn grant message to agree but does not join if grant by SAID already joined, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnGrant)
      .mockResolvedValueOnce(agreeForPresentingExnMessage);

    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
        a: {
          r: NotificationRoute.ExnIpexAgree,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexAgree,
        read: true,
        linkedGroupRequests: {
          EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
            accepted: true,
            saids: {
              EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
                [
                  "EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H",
                  "EFUFE140pcdemyv5DZM3AuIuI_ye5Kd5dytdeIwpaVS1",
                ],
              ],
            },
          },
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: dt,
      },
    ]);

    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      id: "id",
    });

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(ipexCommunications.joinMultisigGrant).not.toBeCalled();

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
      a: {
        r: NotificationRoute.ExnIpexAgree,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexAgree,
      read: true,
      linkedGroupRequests: {
        EEuFpvZ2G_YMm3smqbwZn4SWArxQOen7ZypVVfr6fVCT: {
          accepted: true,
          saids: {
            EKa94ERqArLOvNf9AmItMJtsoGKZPVb3e_pEo_1D37qt: [
              [
                "EFtjdJ1gJW8ty7A_EPMv2g10W0DLO1UQYyZ9Sm0OIw_H",
                "EFUFE140pcdemyv5DZM3AuIuI_ye5Kd5dytdeIwpaVS1",
              ],
              [
                "ECS7jn05fIP_JK1Ub4E6hPviRKEdC55QhxZToxDIHo_E",
                "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
              ],
            ],
          },
        },
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: dt,
    });
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Should return all notifications except those with notification route is /exn/ipex/agree", async () => {
    const mockNotifications = [
      {
        id: "0AC0W27tnnd2WyHWUh-368EI",
        createdAt: new Date("2024-04-29T11:01:04.903Z"),
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig1",
        read: false,
        connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
        linkedGroupRequest: {},
      },
      {
        id: "0AC0W34tnnd2WyUCOy-790AY",
        createdAt: new Date("2024-04-29T11:01:04.903Z"),
        a: { r: NotificationRoute.ExnIpexOffer },
        multisigId: "multisig2",
        read: false,
        connectionId: "ED_5C2-UOA8N3iRrV7o75fIMOnJfoSmYAe829YCiSaVB",
        linkedGroupRequest: {},
      },
    ];

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue(mockNotifications);

    const result = await keriaNotificationService.getAllNotifications();

    expect(notificationStorage.findAllByQuery).toHaveBeenCalledWith({
      $not: {
        route: NotificationRoute.ExnIpexAgree,
      },
    });
    expect(result).toEqual([
      {
        id: "0AC0W27tnnd2WyHWUh-368EI",
        createdAt: "2024-04-29T11:01:04.903Z",
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig1",
        read: false,
        connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
      },
      {
        id: "0AC0W34tnnd2WyUCOy-790AY",
        createdAt: "2024-04-29T11:01:04.903Z",
        a: { r: NotificationRoute.ExnIpexOffer },
        multisigId: "multisig2",
        read: false,
        connectionId: "ED_5C2-UOA8N3iRrV7o75fIMOnJfoSmYAe829YCiSaVB",
      },
    ]);
  });

  test("Should return an empty list notification if no notifications are found", async () => {
    notificationStorage.findAllByQuery.mockResolvedValue([]);
    const result = await keriaNotificationService.getAllNotifications();

    expect(result).toEqual([]);
  });

  test("Should return false if 404 error occurs with route multisig/rpy", async () => {
    groupGetRequestMock.mockRejectedValueOnce(
      new Error("SomeErrorMessage - 404")
    );
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigRpy,
        p: "p",
        a: { i: "i" },
        e: {},
      },
    });
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    await keriaNotificationService.processNotification(
      notificationMultisigRpyProp
    );
    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationMultisigRpyProp.i
    );
  });

  test("Should throw error if other error occurs with route multisig/rpy", async () => {
    const errorMessage = "Error - 500";
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigRpy,
        p: "p",
        a: { i: "i", gid: "gid" },
        e: {
          rpy: {
            r: "/end/role/add",
          },
        },
      },
    });
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(new Error(errorMessage));
    groupGetRequestMock.mockRejectedValueOnce(new Error(errorMessage));
    await expect(
      keriaNotificationService.processNotification(notificationMultisigRpyProp)
    ).rejects.toThrow(errorMessage);
  });

  test("Should throw error if other error occurs with route multisig/icp", async () => {
    const errorMessage = "Error - 500";
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigIcp,
        p: "p",
        a: { i: "i" },
        e: {},
      },
    });
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(new Error(errorMessage));

    groupGetRequestMock.mockRejectedValueOnce(new Error(errorMessage));
    await expect(
      keriaNotificationService.processNotification(notificationMultisigIcpProp)
    ).rejects.toThrow(errorMessage);
  });

  test("Should skip if missing identifier metadata with route multisig/rpy", async () => {
    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigRpy,
        p: "p",
        a: { i: "i" },
        e: {},
      },
    });
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );
    await keriaNotificationService.processNotification(
      notificationMultisigRpyProp
    );
    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationMultisigRpyProp.i
    );
  });

  test("Should return false if 404 error occurs with route multisig/icp", async () => {
    groupGetRequestMock.mockRejectedValueOnce(
      new Error("SomeErrorMessage - 404")
    );
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: NotificationRoute.MultiSigIcp,
        p: "p",
        a: { i: "i" },
        e: {},
      },
    });
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    await keriaNotificationService.processNotification(
      notificationMultisigIcpProp
    );
    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationMultisigIcpProp.i
    );
  });

  test("Should skip if missing identifier metadata with route ipex/grant", async () => {
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: ExchangeRoute.IpexAdmit,
        p: "p",
        a: { i: "i" },
        e: { acdc: { d: "d" } },
      },
    });
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce(credentialStateIssued);
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce(
      credentialMetadataMock
    );
    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );

    await keriaNotificationService.processNotification(
      notificationIpexGrantProp
    );
    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationIpexGrantProp.i
    );
  });

  test("Should throw error if other error occurs with route ipex/grant", async () => {
    const errorMessage = "Error - 500";
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: ExchangeRoute.IpexAdmit,
        p: "p",
        a: { i: "i" },
        e: { acdc: { d: "d" } },
      },
    });
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce(credentialStateIssued);
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce(
      credentialMetadataMock
    );
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(
      keriaNotificationService.processNotification(notificationIpexGrantProp)
    ).rejects.toThrow(errorMessage);
  });

  test("Should skip if missing identifier metadata with admit multisig exn", async () => {
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date(),
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {},
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    identifierStorage.getIdentifierMetadata
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationIpexGrantProp.i
    );
  });

  test("Should throw error if other error occurs with admit multisig exn", async () => {
    const errorMessage = "Error - 500";
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date(),
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {},
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(
      keriaNotificationService.processNotification(notificationMultisigExnProp)
    ).rejects.toThrow(errorMessage);
  });

  test("Should skip if existing credential with admit multisig exn", async () => {
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date(),
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {},
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      id: "id",
    });

    getCredentialMock.mockResolvedValue(getCredentialResponse);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationIpexGrantProp.i
    );
  });

  test("Should mark notification when exist identifier of the sender of the inception event", async () => {
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: ExchangeRoute.IpexOffer,
        p: "p",
        a: { i: "i" },
        e: { acdc: { d: "d" } },
      },
    });

    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      id: "id",
    });

    await keriaNotificationService.processNotification(
      notificationIpexOfferProp
    );
    expect(markNotificationMock).toHaveBeenCalledWith(
      notificationIpexOfferProp.i
    );
  });

  test("Should throw error if other error occurs when call verify notification", async () => {
    const errorMessage = "Error - 500";
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: ExchangeRoute.IpexOffer,
        p: "p",
        a: { i: "i" },
        e: { acdc: { d: "d" } },
      },
    });
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(
      keriaNotificationService.processNotification(notificationIpexOfferProp)
    ).rejects.toThrow(errorMessage);
  });
});

describe("Long running operation tracker", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
  });

  test("Should handle long operations with type group", async () => {
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "group.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "group",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      id: "id",
    });
    await keriaNotificationService.processOperation(operationRecord);
    expect(multiSigs.endRoleAuthorization).toBeCalledWith("id");
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type witness", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "witness.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "witness",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    await keriaNotificationService.processOperation(operationRecord);
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      {
        isPending: false,
      }
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type oobi", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
        oobi: "http://keria:3902/oobi/ELDjcyhsjppizfKQ_AvYeF4RuF1u0O6ya6OYUM6zLYH-/agent/EI4-oLA5XcrZepuB5mDrl3279EjbFtiDrz4im5Q4Ht0O?name=CF%20Credential%20Issuance",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
    const connectionMock = {
      id: "id",
      pending: true,
      createdAt: new Date(),
      alias: "CF Credential Issuance",
    };
    connectionStorage.findById.mockResolvedValueOnce(connectionMock);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "oobi",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    contactGetMock.mockResolvedValueOnce(null);

    await keriaNotificationService.processOperation(operationRecord);
    expect(connectionStorage.update).toBeCalledWith({
      id: connectionMock.id,
      pending: false,
      createdAt: operationMock.response.dt,
      alias: connectionMock.alias,
    });
    expect(contactsUpdateMock).toBeCalledWith(connectionMock.id, {
      alias: "CF Credential Issuance",
      createdAt: operationMock.response.dt,
    });
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, {
      type: EventTypes.ConnectionStateChanged,
      payload: {
        connectionId: "id",
        status: ConnectionStatus.CONFIRMED,
      },
    });
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(2, {
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should delele Keria connection if the connection metadata record exists but pendingDeletion is true", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
        oobi: "http://keria:3902/oobi/ELDjcyhsjppizfKQ_AvYeF4RuF1u0O6ya6OYUM6zLYH-/agent/EI4-oLA5XcrZepuB5mDrl3279EjbFtiDrz4im5Q4Ht0O?name=CF%20Credential%20Issuance",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
    const connectionMock = {
      id: "id",
      pending: true,
      pendingDeletion: true,
      createdAt: new Date(),
      alias: "CF Credential Issuance",
    };
    connectionStorage.findById.mockResolvedValueOnce(connectionMock);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "oobi",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    contactGetMock.mockResolvedValueOnce(null);

    await keriaNotificationService.processOperation(operationRecord);
    expect(contactDeleteMock).toBeCalledWith("id");
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should delete Keria connection if local connection metadata record does not exist", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
        oobi: "http://keria:3902/oobi/ELDjcyhsjppizfKQ_AvYeF4RuF1u0O6ya6OYUM6zLYH-/agent/EI4-oLA5XcrZepuB5mDrl3279EjbFtiDrz4im5Q4Ht0O?name=CF%20Credential%20Issuance",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
    connectionStorage.findById.mockResolvedValueOnce(null);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "oobi",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    contactGetMock.mockResolvedValueOnce(null);

    await keriaNotificationService.processOperation(operationRecord);
    expect(contactDeleteMock).toBeCalledWith("id");
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test.skip("Cannot create connection if the connection is already created", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
        oobi: "http://keria:3902/oobi/ELDjcyhsjppizfKQ_AvYeF4RuF1u0O6ya6OYUM6zLYH-/agent/EI4-oLA5XcrZepuB5mDrl3279EjbFtiDrz4im5Q4Ht0O?name=CF%20Credential%20Issuance",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
    operationsGetMock.mockResolvedValue(operationMock);
    const connectionMock = {
      id: "id",
      pending: true,
      createdAt: new Date(),
      alias: "CF Credential Issuance",
    };
    connectionStorage.findById.mockResolvedValueOnce(connectionMock);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "oobi",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    contactGetMock.mockResolvedValueOnce({
      alias: "alias",
      oobi: "oobi",
      id: "id",
      createdAt: new Date(),
    });
    await keriaNotificationService.processOperation(operationRecord);
    expect(connectionStorage.update).toBeCalledTimes(0);
    expect(contactsUpdateMock).toBeCalledTimes(0);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.receivecredential", async () => {
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexAdmit,
          p: "p",
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexGrant,
          d: "d",
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.receivecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await keriaNotificationService.processOperation(operationRecord);
    expect(credentialService.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.CONFIRMED
    );
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.offercredential", async () => {
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexApply,
          p: "p",
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexOffer,
          d: "d",
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.offercredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.offercredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await keriaNotificationService.processOperation(operationRecord);
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.presentcredential", async () => {
    const credentialIdMock = "credentialId";
    const grantExchangeMock = {
      exn: {
        r: ExchangeRoute.IpexGrant,
        d: "d",
        e: {
          acdc: {
            d: credentialIdMock,
          },
        },
      },
    };
    const agreeExchange = {
      exn: {
        r: ExchangeRoute.IpexAgree,
        p: "p",
      },
    };
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce(grantExchangeMock)
      .mockResolvedValueOnce(agreeExchange);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.presentcredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.presentcredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await keriaNotificationService.processOperation(operationRecord);
    expect(ipexCommunications.createLinkedIpexMessageRecord).toBeCalledWith(
      grantExchangeMock,
      ConnectionHistoryType.CREDENTIAL_PRESENTED
    );
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with default case", async () => {
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "id",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "unknown",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    };
    await keriaNotificationService.processOperation(
      operationRecord as OperationPendingRecord
    );

    expect(operationPendingStorage.deleteById).toHaveBeenCalledWith(
      operationRecord.id
    );
  });

  test("Should delete original grant notification when multi-sig admit operation completes", async () => {
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexAdmit,
          p: "p",
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexGrant,
          d: "d",
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.receivecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      multisigManageAid: "EAL7pX9Hklc_iq7pkVYSjAilCfQX3sr5RbX76AxYs2UH",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      updatedAt: new Date(),
    });

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedGroupRequests: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);
    expect(credentialService.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.CONFIRMED
    );
    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(eventEmitter.emit).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationRemoved,
      payload: {
        keriaNotif: {
          a: {
            d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
            r: NotificationRoute.ExnIpexGrant,
          },
          connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
          createdAt: "2024-08-01T10:36:17.814Z",
          id: "id",
          multisigId: undefined,
          read: true,
        },
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
    expect(markNotificationMock).toBeCalledWith("id");
  });

  test("Should delete original apply notification when multi-sig offer operation completes", async () => {
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexOffer,
          p: "p",
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexApply,
          d: "d",
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.offercredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.offercredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      multisigManageAid: "EAL7pX9Hklc_iq7pkVYSjAilCfQX3sr5RbX76AxYs2UH",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedGroupRequests: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);
    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(eventEmitter.emit).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationRemoved,
      payload: {
        keriaNotif: {
          a: {
            d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
            r: NotificationRoute.ExnIpexApply,
          },
          connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
          createdAt: "2024-08-01T10:36:17.814Z",
          id: "id",
          multisigId: undefined,
          read: true,
        },
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
    expect(markNotificationMock).toBeCalledWith("id");
  });

  test("Should delete original agree notification when multi-sig grant operation completes", async () => {
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexGrant,
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
          p: "p",
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexAgree,
          d: "d",
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.presentcredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.presentcredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      multisigManageAid: "EAL7pX9Hklc_iq7pkVYSjAilCfQX3sr5RbX76AxYs2UH",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date(),
        a: {
          r: NotificationRoute.ExnIpexAgree,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexAgree,
        read: true,
        linkedGroupRequests: {
          "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
        },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);
    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
    expect(markNotificationMock).toBeCalledWith("id");
  });

  test("ExchangeReceiveCredential operations must have an exchange route of /ipex/admit", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const operationMock = {
      metadata: {
        said: "said",
      },
      done: true,
      response: {
        i: "id",
        dt: new Date(),
      },
    };
    operationsGetMock.mockResolvedValue(operationMock);
    const credentialIdMock = "credentialId";
    exchangesGetMock.mockResolvedValueOnce({
      exn: {
        r: ExchangeRoute.IpexGrant,
        e: {
          acdc: {
            d: credentialIdMock,
          },
        },
      },
    });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.receivecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    await keriaNotificationService.processOperation(operationRecord);
    expect(operationsGetMock).toBeCalledTimes(1);
    expect(credentialService.markAcdc).toBeCalledTimes(0);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should call setTimeout listening for pending operations if Keria is offline", async () => {
    // We mock the setTimeout here so we can exit the while(true) loop
    jest.spyOn(global, "setTimeout").mockImplementation(() => {
      throw new Error("Force Exit");
    });
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    operationPendingGetAllMock.mockResolvedValueOnce([
      {
        type: "OperationPendingRecord",
        id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "exchange.receivecredential",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
    try {
      await keriaNotificationService.pollLongOperations();
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(operationsGetMock).not.toBeCalled();
    expect(setTimeout).toHaveBeenCalledWith(
      keriaNotificationService.pollLongOperations,
      KeriaNotificationService.POLL_KERIA_INTERVAL
    );
  });

  test("Should update notification marker after the notification is processed", async () => {
    jest
      .spyOn(keriaNotificationService as any, "getKeriaOnlineStatus")
      .mockReturnValue(true);
    jest.spyOn(console, "error").mockReturnValueOnce();
    basicStorage.findById.mockResolvedValueOnce({
      id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
      content: {
        nextIndex: 0,
        lastNotificationId: "",
      },
    });
    let firstTry = true;
    listNotificationsMock.mockImplementation(async () => {
      if (firstTry) {
        firstTry = false;
        return {
          start: 0,
          end: 2,
          total: 2,
          notes: [
            {
              i: "string",
              dt: "string",
              r: true,
              a: {
                r: NotificationRoute.ExnIpexApply,
                d: "string",
                m: "",
              },
            },
            {
              i: "string",
              dt: "string",
              r: true,
              a: {
                r: NotificationRoute.MultiSigExn,
                d: "string",
                m: "",
              },
            },
          ],
        };
      } else {
        throw new Error("Break the while loop");
      }
    });
    try {
      await keriaNotificationService.pollNotifications();
    } catch (error) {
      expect((error as Error).message).toBe("Break the while loop");
    }
    expect(basicStorage.createOrUpdateBasicRecord).toBeCalledTimes(2);
    expect(setTimeout).toHaveBeenCalledWith(
      keriaNotificationService.pollNotifications,
      KeriaNotificationService.POLL_KERIA_INTERVAL
    );
  });

  test("Should register callback for NotificationAdded event", () => {
    const callback = jest.fn();
    keriaNotificationService.onNewNotification(callback);

    expect(eventEmitter.on).toHaveBeenCalledWith(
      EventTypes.NotificationAdded,
      callback
    );
  });

  test("Should register callback for OperationComplete event", () => {
    const callback = jest.fn();
    keriaNotificationService.onLongOperationComplete(callback);

    expect(eventEmitter.on).toHaveBeenCalledWith(
      EventTypes.OperationComplete,
      callback
    );
  });

  test("Should register callback for NotificationRemoved event", () => {
    const callback = jest.fn();
    keriaNotificationService.onRemoveNotification(callback);

    expect(eventEmitter.on).toHaveBeenCalledWith(
      EventTypes.NotificationRemoved,
      callback
    );
  });

  test("Should retry connection when \"Failed to fetch\" error occurs when process operation", async () => {
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.receivecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    operationsGetMock.mockRejectedValueOnce(new Error("Failed to fetch"));
    jest
      .spyOn(keriaNotificationService as any, "getKeriaOnlineStatus")
      .mockReturnValue(true);

    await keriaNotificationService.processOperation(operationRecord);

    expect(Agent.agent.markAgentStatus).toHaveBeenCalledWith(false);
    expect(Agent.agent.connect).toHaveBeenCalled();
  });

  test("Should throw other errors when process operation", async () => {
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.receivecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    const errorMessage = "Error - 500";
    operationsGetMock.mockRejectedValueOnce(new Error(errorMessage));
    jest
      .spyOn(keriaNotificationService as any, "getKeriaOnlineStatus")
      .mockReturnValue(true);

    await expect(
      keriaNotificationService.processOperation(operationRecord)
    ).rejects.toThrow(errorMessage);
  });
});
