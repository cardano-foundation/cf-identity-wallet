import { Agent } from "../agent";
import {
  ConnectionStatus,
  ExchangeRoute,
  MiscRecordId,
  NotificationRoute,
} from "../agent.types";
import {
  BasicRecord,
  IdentifierStorage,
  NotificationStorage,
} from "../records";
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
  notificationIpexAgreeProp,
  groupIdentifierMetadataRecord,
} from "../../__fixtures__/agent/keriaNotificationFixtures";
import { ConnectionHistoryType } from "./connectionService.types";
import { StorageMessage } from "../../storage/storage.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { CreationStatus } from "./identifier.types";

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
    iss: "iss",
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
  update: jest.fn(),
});

const multiSigs = jest.mocked({
  joinAuthorization: jest.fn(),
  hasMultisig: jest.fn(),
  endRoleAuthorization: jest.fn(),
  getMultisigParticipants: jest.fn(),
});

const ipexCommunications = jest.mocked({
  createLinkedIpexMessageRecord: jest.fn(),
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

// @TODO - foconnor: Tests shouldn't rely on Agent.agent here, revisit.
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
      markAgentStatus: jest.fn(),
      connect: jest.fn(),
    },
  },
}));

eventEmitter.emit = jest.fn();
eventEmitter.on = jest.fn();

const DATETIME = new Date();

describe("Signify notification service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    markNotificationMock.mockResolvedValue({ status: "done" });
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
      .mockResolvedValue({
        id: "id",
      });
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
      linkedRequest: { accepted: false },
    });

    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);

    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }

    expect(eventEmitter.emit).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationAdded,
      payload: {
        note: {
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
          groupReplied: false,
        },
      },
    });
  });

  test("Should admit revocation if there is an existing credential", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "rev",
    });
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

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

  test("Should mark notification as read in DB", async () => {
    const notification = {
      id: "id",
      read: false,
    };

    notificationStorage.findById = jest.fn().mockResolvedValue(notification);
    await keriaNotificationService.readNotification(notification.id);
    expect(notificationStorage.update).toBeCalledWith({ id: "id", read: true });
  });

  test("Should mark notification as unread in DB", async () => {
    const notification = {
      id: "id",
      read: true,
    };

    notificationStorage.findById = jest.fn().mockResolvedValue(notification);
    await keriaNotificationService.unreadNotification(notification.id);
    expect(notificationStorage.update).toBeCalledWith({
      id: "id",
      read: false,
    });
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

  test("Should skip multi-sig inceptions if the identifier already exists", async () => {
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

  test("Should skip invalid multi-sig inception messages (no gid)", async () => {
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

  test("Can process incoming presentation requests and log in connection history", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "id",
      createdAt: new Date(),
      linkedRequest: { accepted: false },
    });
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

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

  test("Should call createLinkedIpexMessageRecord with TEL status is revoked and exists locally", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "rev",
    });
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "id",
      createdAt: new Date(),
      linkedRequest: { accepted: false },
    });
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

    const notification = {
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date(),
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: false,
      linkedRequest: { accepted: false },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    };
    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notification]);
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

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
    expect(markNotificationMock).toBeCalledTimes(2);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationAdded,
      payload: {
        note: {
          id: "id",
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/
          ),
          a: {
            r: NotificationRoute.LocalAcdcRevoked,
            credentialId: credentialMetadataMock.id,
            credentialTitle: credentialMetadataMock.credentialType,
          },
          read: false,
          connectionId: grantForIssuanceExnMessage.exn.i,
          groupReplied: false,
        },
      },
    });
  });

  test("Should delete old issuance notifications if the same credential gets revoked in a new notification", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "rev",
    });
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "id",
      createdAt: new Date(),
      linkedRequest: { accepted: false },
    });
    credentialStorage.getCredentialMetadata.mockResolvedValue(undefined);
    const notification = {
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date(),
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: false,
      linkedGlinkedRequestroupRequest: { accepted: false },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    };
    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notification]);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

    await keriaNotificationService.processNotification(
      notificationIpexGrantProp
    );

    expect(notificationStorage.deleteById).toBeCalledWith(notification.id);
    expect(credentialService.markAcdc).toBeCalledTimes(0);
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, {
      type: EventTypes.NotificationRemoved,
      payload: {
        id: notification.id,
      },
    });
  });

  test("Should error if we receive a iss grant for an existing credential (set for re-processing in case of TEL update -> rev delays)", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "iss",
    });
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
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
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

    await expect(
      keriaNotificationService.processNotification(notificationIpexGrantProp)
    ).rejects.toThrowError(KeriaNotificationService.DUPLICATE_ISSUANCE);

    expect(notificationStorage.deleteById).not.toBeCalled();
    expect(credentialService.markAcdc).not.toBeCalled();
    expect(markNotificationMock).not.toBeCalled();
    expect(eventEmitter.emit).not.toBeCalled();
  });

  test("Should error if we receive a iss grant but have existing iss notification (set for re-processing in case of TEL update -> rev delays)", async () => {
    exchangesGetMock.mockResolvedValue(grantForIssuanceExnMessage);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    credentialStateMock.mockResolvedValueOnce({
      ...credentialStateIssued,
      et: "iss",
    });
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    const notification = {
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date(),
      a: {
        r: NotificationRoute.ExnIpexGrant,
        d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
      },
      route: NotificationRoute.ExnIpexGrant,
      read: false,
      linkedGlinkedRequestroupRequest: { accepted: false },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    };
    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue([notification]);
    getCredentialMock.mockResolvedValue(getCredentialResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

    await expect(
      keriaNotificationService.processNotification(notificationIpexGrantProp)
    ).rejects.toThrowError(KeriaNotificationService.DUPLICATE_ISSUANCE);

    expect(notificationStorage.deleteById).not.toBeCalled();
    expect(credentialService.markAcdc).not.toBeCalled();
    expect(markNotificationMock).not.toBeCalled();
    expect(eventEmitter.emit).not.toBeCalled();
  });

  test("Should skip if notification route is /multisig/exn and `e.exn.r` is not ipex/admit, ipex/offer, ipex/grant", async () => {
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [notificationMultisigExnProp];

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnApplyForPresenting)
      .mockResolvedValueOnce({ exn: { d: "d" } });

    identifierStorage.getIdentifierMetadata
      .mockRejectedValue(
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

  test("Should skip if notification route is /multisig/exn and the identifier is missing", async () => {
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnApplyForPresenting)
      .mockResolvedValueOnce({ exn: { d: "d" } });
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({});

    const notes = [notificationMultisigExnProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should skip if notification route is /multisig/exn and the credential exists", async () => {
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

  test("Original grant is linked to received /multisig/exn admit message and refreshed, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps)
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );

    exchangesGetMock.mockResolvedValueOnce(multisigExnAdmitForIssuance);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: DATETIME,
        a: {
          r: NotificationRoute.ExnIpexGrant,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexGrant,
        read: true,
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: DATETIME,
      },
    ]);
    credentialStorage.getCredentialMetadata.mockResolvedValue(null);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(notificationStorage.update).toBeCalledWith(
      expect.objectContaining({
        id: "id",
        read: false,
        route: NotificationRoute.ExnIpexGrant,
        linkedRequest: {
          accepted: false,
          current: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
        },
      })
    );
    expect(notificationStorage.update).not.toBeCalledWith(
      expect.objectContaining({
        createdAt: DATETIME,
      })
    );
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, {
      type: EventTypes.NotificationRemoved,
      payload: {
        id: "id",
      },
    });
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: EventTypes.NotificationAdded,
        payload: expect.objectContaining({
          note: expect.objectContaining({
            id: "id",
          }),
        }),
      })
    );
    expect(eventEmitter.emit).not.toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: EventTypes.NotificationAdded,
        payload: expect.objectContaining({
          note: expect.objectContaining({
            createdAt: DATETIME,
          }),
        }),
      })
    );
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
  });

  test("/multisig/exn admit messages skipped if credential already received", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps)
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    credentialStorage.getCredentialMetadata.mockResolvedValue(
      credentialMetadataMock
    );

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(notificationStorage.update).not.toBeCalled();
    expect(markNotificationMock).toBeCalledWith("string");
    expect(notificationStorage.save).not.toBeCalled();
  });

  test("Out of order /multisig/exn admit messages error out for re-processing (issuer grant not received yet)", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);

    exchangesGetMock
      .mockResolvedValueOnce(multisigExnAdmitForIssuance)
      .mockResolvedValueOnce(grantForIssuanceExnMessage);

    identifierStorage.getIdentifierMetadata.mockRejectedValueOnce(
      new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
    );
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    credentialStorage.getCredentialMetadata.mockResolvedValue(null);

    await expect(
      keriaNotificationService.processNotification(notificationMultisigExnProp)
    ).rejects.toThrowError(KeriaNotificationService.OUT_OF_ORDER_NOTIFICATION);

    expect(notificationStorage.update).not.toBeCalledWith();
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
  });

  test("Should return all notifications", async () => {
    const mockNotifications = [
      {
        id: "0AC0W27tnnd2WyHWUh-368EI",
        createdAt: DATETIME,
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig1",
        read: false,
        connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
        linkedRequest: { accepted: false },
        hidden: false,
      },
      {
        id: "0AC0W34tnnd2WyUCOy-790AY",
        createdAt: DATETIME,
        a: { r: NotificationRoute.ExnIpexOffer },
        multisigId: "multisig2",
        read: false,
        connectionId: "ED_5C2-UOA8N3iRrV7o75fIMOnJfoSmYAe829YCiSaVB",
        linkedRequest: { accepted: false },
        hidden: false,
      },
    ];

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue(mockNotifications);

    const result = await keriaNotificationService.getNotifications();

    expect(notificationStorage.findAllByQuery).toHaveBeenCalledWith({
      $not: {
        route: NotificationRoute.ExnIpexAgree,
      },
      hidden: false,
    });
    expect(result).toEqual([
      {
        id: "0AC0W27tnnd2WyHWUh-368EI",
        createdAt: DATETIME.toISOString(),
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig1",
        read: false,
        connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
        groupReplied: false,
      },
      {
        id: "0AC0W34tnnd2WyUCOy-790AY",
        createdAt: DATETIME.toISOString(),
        a: { r: NotificationRoute.ExnIpexOffer },
        multisigId: "multisig2",
        read: false,
        connectionId: "ED_5C2-UOA8N3iRrV7o75fIMOnJfoSmYAe829YCiSaVB",
        groupReplied: false,
      },
    ]);
  });

  test("Notifications should indiciate if there in a current response or proposal", async () => {
    const mockNotifications = [
      {
        id: "0AC0W27tnnd2WyHWUh-368EI",
        createdAt: DATETIME,
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig1",
        read: false,
        connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
        linkedRequest: { accepted: false },
      },
      {
        id: "0AC0W34tnnd2WyUCOy-790AY",
        createdAt: DATETIME,
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig2",
        read: false,
        connectionId: "ED_5C2-UOA8N3iRrV7o75fIMOnJfoSmYAe829YCiSaVB",
        linkedRequest: { accepted: false, current: "current-admit-said" },
      },
    ];

    notificationStorage.findAllByQuery = jest
      .fn()
      .mockResolvedValue(mockNotifications);

    const result = await keriaNotificationService.getNotifications();

    expect(notificationStorage.findAllByQuery).toHaveBeenCalledWith({
      $not: {
        route: NotificationRoute.ExnIpexAgree,
      },
      hidden: false,
    });
    expect(result).toEqual([
      {
        id: "0AC0W27tnnd2WyHWUh-368EI",
        createdAt: DATETIME.toISOString(),
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig1",
        read: false,
        connectionId: "ED_3K5-VPI8N3iRrV7o75fIMOnJfoSmEJy679HTkWsFQ",
        groupReplied: false,
      },
      {
        id: "0AC0W34tnnd2WyUCOy-790AY",
        createdAt: DATETIME.toISOString(),
        a: { r: NotificationRoute.ExnIpexGrant },
        multisigId: "multisig2",
        read: false,
        connectionId: "ED_5C2-UOA8N3iRrV7o75fIMOnJfoSmYAe829YCiSaVB",
        groupReplied: true,
      },
    ]);
  });

  test("Should return an empty list notification if no notifications are found", async () => {
    notificationStorage.findAllByQuery.mockResolvedValue([]);
    const result = await keriaNotificationService.getNotifications();

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
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValueOnce({ linkedRequest: { current: "current_id" } });

    jest.useRealTimers();
    await keriaNotificationService.processNotification(
      notificationIpexGrantProp
    );
    jest.useFakeTimers();
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
        linkedRequest: { accepted: false },
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
        linkedRequest: { accepted: false },
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

  test("Should store /ipex/agree notifications but emit no event, and for individual identifiers auto-grant in response", async () => {
    exchangesGetMock.mockResolvedValue(agreeForPresentingExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "id",
      createdAt: new Date(),
      linkedRequest: { accepted: false },
    });

    const notes = [notificationIpexAgreeProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }

    expect(notificationStorage.save).toBeCalledWith({
      a: notificationIpexAgreeProp.a,
      read: false,
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      credentialId: undefined,
      id: notificationIpexAgreeProp.i,
      route: NotificationRoute.ExnIpexAgree,
      createdAt: new Date(notificationIpexAgreeProp.dt),
    });
    expect(eventEmitter.emit).not.toBeCalled();
    expect(ipexCommunications.grantAcdcFromAgree).toBeCalledWith("string");
  });

  test("Should auto-grant in response to agree even if the notification exists in the DB (allows retry on grant)", async () => {
    exchangesGetMock.mockResolvedValue(agreeForPresentingExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue({
        id: "id",
      });
    notificationStorage.save.mockRejectedValue(
      new Error(`${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG} string`)
    );

    const notes = [notificationIpexAgreeProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }

    expect(notificationStorage.save).toBeCalledWith({
      a: notificationIpexAgreeProp.a,
      read: false,
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      credentialId: undefined,
      id: notificationIpexAgreeProp.i,
      route: NotificationRoute.ExnIpexAgree,
      createdAt: new Date(notificationIpexAgreeProp.dt),
    });
    expect(eventEmitter.emit).not.toBeCalled();
    expect(ipexCommunications.grantAcdcFromAgree).toBeCalledWith("string");
  });
});

// @TODO - foconnor: Move remaining IPEX tests
describe("Group IPEX presentation", () => {
  test("Original apply is linked to received /multisig/exn offer message and refreshed, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(groupIdentifierMetadataRecord);
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnOfferForPresenting)
      .mockResolvedValueOnce(applyForPresentingExnMessage);

    multiSigs.getMultisigParticipants.mockResolvedValue({
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
          aid: "EGrdtLIlSIQHF1gHhE7UVfs9yRF-EDhqtLT41pJlj_z8",
          ends: [],
        },
        {
          aid: "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
          ends: [],
        },
      ],
    });

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: DATETIME,
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: DATETIME,
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    expect(multiSigs.getMultisigParticipants).toBeCalledWith(
      "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR"
    );

    expect(notificationStorage.update).toBeCalledWith(
      expect.objectContaining({
        id: "id",
        route: NotificationRoute.ExnIpexApply,
        linkedRequest: {
          accepted: false,
          current: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
        },
        read: false,
      })
    );
    expect(notificationStorage.update).not.toBeCalledWith(
      expect.objectContaining({
        createdAt: DATETIME,
      })
    );
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, {
      type: EventTypes.NotificationRemoved,
      payload: {
        id: "id",
      },
    });
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: EventTypes.NotificationAdded,
        payload: expect.objectContaining({
          note: expect.objectContaining({
            id: "id",
            read: false,
          }),
        }),
      })
    );
    expect(eventEmitter.emit).not.toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: EventTypes.NotificationAdded,
        payload: expect.objectContaining({
          note: expect.objectContaining({
            createdAt: DATETIME,
          }),
        }),
      })
    );
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
  });

  test("Out of order IPEX /multisig/exn offer messages error for re-processing", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(groupIdentifierMetadataRecord);
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnOfferForPresenting)
      .mockResolvedValueOnce(applyForPresentingExnMessage);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);

    await expect(
      keriaNotificationService.processNotification(notificationMultisigExnProp)
    ).rejects.toThrowError(KeriaNotificationService.OUT_OF_ORDER_NOTIFICATION);

    expect(notificationStorage.update).not.toBeCalled();
  });

  test("Original agree is linked to /multisig/exn grant message and is auto-joined, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(groupIdentifierMetadataRecord);
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
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date("2024-04-29T11:01:04.903Z"),
      },
    ]);

    await keriaNotificationService.processNotification(
      notificationMultisigExnProp
    );

    const updatedAgree = {
      id: "id",
      route: NotificationRoute.ExnIpexAgree,
      linkedRequest: {
        accepted: false,
        current: "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO",
      },
    };
    expect(notificationStorage.update).toBeCalledWith(
      expect.objectContaining(updatedAgree)
    );
    expect(markNotificationMock).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
    expect(ipexCommunications.joinMultisigGrant).toBeCalledWith(
      multisigExnGrant,
      expect.objectContaining(updatedAgree)
    );
  });

  test("Out of order IPEX /multisig/exn grant messages error for re-processing", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(groupIdentifierMetadataRecord);
    exchangesGetMock
      .mockResolvedValueOnce(multisigExnGrant)
      .mockResolvedValueOnce(agreeForPresentingExnMessage);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);

    await expect(
      keriaNotificationService.processNotification(notificationMultisigExnProp)
    ).rejects.toThrowError(KeriaNotificationService.OUT_OF_ORDER_NOTIFICATION);

    expect(notificationStorage.update).not.toBeCalled();
  });

  test("Should store /ipex/agree notifications but emit no event, and for group initiators auto-grant in response", async () => {
    exchangesGetMock.mockResolvedValue(agreeForPresentingExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(groupIdentifierMetadataRecord);
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "id",
      createdAt: new Date(),
      linkedRequest: { accepted: false },
    });
    identifiersMemberMock.mockResolvedValue({
      signing: [
        {
          aid: "EAL7pX9Hklc_iq7pkVYSjAilCfQX3sr5RbX76AxYs2UH",
        },
        {
          aid: "memberB",
        },
        {
          aid: "memberC",
        },
      ],
    });

    const notes = [notificationIpexAgreeProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }

    expect(notificationStorage.save).toBeCalledWith({
      a: notificationIpexAgreeProp.a,
      read: false,
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      credentialId: undefined,
      id: notificationIpexAgreeProp.i,
      route: NotificationRoute.ExnIpexAgree,
      createdAt: new Date(notificationIpexAgreeProp.dt),
    });
    expect(eventEmitter.emit).not.toBeCalled();
    expect(identifiersMemberMock).toBeCalledWith(
      "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli"
    );
    expect(ipexCommunications.grantAcdcFromAgree).toBeCalledWith("string");
  });

  test("Should store /ipex/agree notifications but emit no event, and do nothing else if not group initiator", async () => {
    exchangesGetMock.mockResolvedValue(agreeForPresentingExnMessage);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValueOnce(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      )
      .mockResolvedValue(groupIdentifierMetadataRecord);
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "id",
      createdAt: new Date(),
      linkedRequest: { accepted: false },
    });
    identifiersMemberMock.mockResolvedValue({
      signing: [
        {
          aid: "memberA",
        },
        {
          aid: "EAL7pX9Hklc_iq7pkVYSjAilCfQX3sr5RbX76AxYs2UH",
        },
        {
          aid: "memberC",
        },
      ],
    });

    const notes = [notificationIpexAgreeProp];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }

    expect(notificationStorage.save).toBeCalledWith({
      a: notificationIpexAgreeProp.a,
      read: false,
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      credentialId: undefined,
      id: notificationIpexAgreeProp.i,
      route: NotificationRoute.ExnIpexAgree,
      createdAt: new Date(notificationIpexAgreeProp.dt),
    });
    expect(eventEmitter.emit).not.toBeCalled();
    expect(identifiersMemberMock).toBeCalledWith(
      "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli"
    );
    expect(ipexCommunications.grantAcdcFromAgree).not.toBeCalled();
  });
});

describe("Failed notifications", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should create a new failed notification to basic record if processNotification throws any error", async () => {
    jest.useFakeTimers();
    jest
      .spyOn(keriaNotificationService as any, "getKeriaOnlineStatus")
      .mockReturnValue(true);
    jest.spyOn(console, "error").mockReturnValueOnce();
    basicStorage.findById = jest.fn().mockResolvedValueOnce({
      id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
      content: {
        nextIndex: 0,
        lastNotificationId: "",
      },
    });
    let firstTry = true;
    const notifications = [
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
    ];
    listNotificationsMock.mockImplementation(async () => {
      if (firstTry) {
        firstTry = false;
        return {
          start: 0,
          end: 2,
          total: 2,
          notes: notifications,
        };
      } else {
        throw new Error("Break the while loop");
      }
    });

    keriaNotificationService.processNotification = jest
      .fn()
      .mockRejectedValue("error");
    basicStorage.createOrUpdateBasicRecord.mockResolvedValueOnce({
      id: MiscRecordId.FAILED_NOTIFICATIONS,
      content: {
        [notifications[0].i]: {
          notification: notifications[0],
          attempts: 1,
          lastAttempt: Date.now(),
        },
      },
    });
    try {
      await keriaNotificationService.pollNotifications();
    } catch (error) {
      expect((error as Error).message).toBe("Break the while loop");
    }
    expect(basicStorage.createOrUpdateBasicRecord).toBeCalledTimes(4);
  });

  test("Should retry failed notifications and remove successfully processed ones", async () => {
    jest.spyOn(keriaNotificationService, "processNotification");
    const notif1 = {
      i: "notif1",
      dt: "string",
      r: true,
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "string",
        m: "",
      },
    };
    const notif2 = {
      i: "notif2",
      dt: "string",
      r: true,
      a: {
        r: NotificationRoute.MultiSigExn,
        d: "string",
        m: "",
      },
    };
    const notif3 = {
      i: "notif3",
      dt: "string",
      r: true,
      a: {
        r: NotificationRoute.MultiSigExn,
        d: "string",
        m: "",
      },
    };
    const failedNotifications = {
      notif1: {
        notification: notif1,
        attempts: 1,
        lastAttempt: Date.now() - 6000,
      }, // Ready for retry
      notif2: {
        notification: notif2,
        attempts: 3,
        lastAttempt: Date.now() - 50000,
      }, // Ready for retry
      notif3: {
        notification: notif3,
        attempts: 5,
        lastAttempt: Date.now() - 1000,
      }, // Not ready yet
    };

    basicStorage.findById = jest.fn().mockResolvedValueOnce(
      new BasicRecord({
        id: MiscRecordId.FAILED_NOTIFICATIONS,
        content: failedNotifications,
        createdAt: new Date(),
      })
    );

    await keriaNotificationService.retryFailedNotifications();
    const now = new Date();
    expect(keriaNotificationService.processNotification).toHaveBeenCalledTimes(
      2
    );
    expect(keriaNotificationService.processNotification).toHaveBeenCalledWith(
      notif1
    );
    expect(keriaNotificationService.processNotification).toHaveBeenCalledWith(
      notif2
    );

    expect(basicStorage.update).toHaveBeenCalledWith(
      new BasicRecord({
        id: MiscRecordId.FAILED_NOTIFICATIONS,
        content: {
          notif3: failedNotifications.notif3,
        },
        createdAt: now,
      })
    );
  });

  test("Should handle failure when retrying a failed notification", async () => {
    const notif1 = {
      i: "notif1",
      dt: "string",
      r: true,
      a: {
        r: NotificationRoute.ExnIpexApply,
        d: "string",
        m: "",
      },
    };

    const failedNotifications = {
      notif1: {
        notification: notif1,
        attempts: 1,
        lastAttempt: Date.now() - 6000,
      },
    };

    basicStorage.findById = jest.fn().mockResolvedValue({
      id: MiscRecordId.FAILED_NOTIFICATIONS,
      content: failedNotifications,
      createdAt: new Date(),
    });

    jest
      .spyOn(keriaNotificationService, "processNotification")
      .mockRejectedValue(new Error("Process notification failed"));

    await keriaNotificationService.retryFailedNotifications();
    expect(basicStorage.createOrUpdateBasicRecord).toHaveBeenCalledWith(
      new BasicRecord({
        id: MiscRecordId.FAILED_NOTIFICATIONS,
        content: {
          notif1: {
            ...failedNotifications.notif1,
            attempts: 2,
            lastAttempt: Date.now(),
          },
        },
      })
    );
  });

  test("Should retry failed notifications if more than 1 minute have passed", async () => {
    jest.useFakeTimers();
    jest.spyOn(keriaNotificationService, "retryFailedNotifications");
    jest
      .spyOn(keriaNotificationService as any, "getKeriaOnlineStatus")
      .mockReturnValue(true);
    let firstTry = true;
    const notifications = [
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
    ];

    listNotificationsMock.mockImplementation(async () => {
      if (firstTry) {
        firstTry = false;
        return {
          start: 0,
          end: 2,
          total: 2,
          notes: notifications,
        };
      } else {
        throw new Error("Break the while loop");
      }
    });

    keriaNotificationService.processNotification = jest
      .fn()
      .mockRejectedValue("error");
    jest.advanceTimersByTime(60001);

    try {
      await keriaNotificationService.pollNotifications();
    } catch (error) {
      expect((error as Error).message).toBe("Break the while loop");
    }
    expect(
      keriaNotificationService.retryFailedNotifications
    ).toHaveBeenCalledTimes(1);
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
    markNotificationMock.mockResolvedValue({ status: "done" });
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

    expect(multiSigs.endRoleAuthorization).toBeCalledWith(
      "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "group.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
        creationStatus: CreationStatus.COMPLETE,
      }
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationComplete,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "witness.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
  });

  test("Should handle long operations with type exchange.receivecredential and delete original notification", async () => {
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
    notificationStorage.findAllByQuery.mockResolvedValue([
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
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);

    expect(credentialService.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.CONFIRMED
    );
    expect(ipexCommunications.createLinkedIpexMessageRecord).toBeCalledWith(
      {
        exn: {
          r: ExchangeRoute.IpexAdmit,
          p: "p",
        },
      },
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );
    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(markNotificationMock).toBeCalledWith("id");
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
  });

  test("Should handle long operations with type exchange.offercredential and delete original notification", async () => {
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexOffer,
          d: "d",
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexApply,
          p: "p",
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
    notificationStorage.findAllByQuery.mockResolvedValue([
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
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);

    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(markNotificationMock).toBeCalledWith("id");
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.offercredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
  });

  test("Should handle long operations with type exchange.presentcredential and delete original notification", async () => {
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
    notificationStorage.findAllByQuery.mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        a: {
          r: NotificationRoute.ExnIpexAgree,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexAgree,
        read: true,
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);

    expect(ipexCommunications.createLinkedIpexMessageRecord).toBeCalledWith(
      grantExchangeMock,
      ConnectionHistoryType.CREDENTIAL_PRESENTED
    );
    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(markNotificationMock).toBeCalledWith("id");
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.presentcredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
        linkedRequest: { accepted: false },
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
    expect(markNotificationMock).toBeCalledWith("id");
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, {
      type: EventTypes.NotificationRemoved,
      payload: {
        id: "id",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
  });

  test("Should refresh original apply notification when multi-sig offer operation completes", async () => {
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
              d: "credential-said",
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
        createdAt: DATETIME,
        a: {
          r: NotificationRoute.ExnIpexApply,
          d: "EIDUavcmyHBseNZAdAHR3SF8QMfX1kSJ3Ct0OqS0-HCW",
        },
        route: NotificationRoute.ExnIpexApply,
        read: true,
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
        groupReplied: true,
        initiatorAid: "EAL7pX9Hklc_iq7pkVYSjAilCfQX3sr5RbX76AxYs2UH",
        groupInitiator: true,
      },
    ]);

    multiSigs.getMultisigParticipants.mockResolvedValue({
      ourIdentifier: {
        id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
        displayName: "holder",
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
          aid: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
          ends: [],
        },
        {
          aid: "EGaEIhOGSTPccSMvnXvfvOVyC1C5AFq62GLTrRKVZBS5",
          ends: [],
        },
      ],
    });

    await keriaNotificationService.processOperation(operationRecord);

    expect(notificationStorage.delete).not.toBeCalled();
    expect(notificationStorage.update).toBeCalledWith(
      expect.objectContaining({
        read: false,
      })
    );
    expect(notificationStorage.update).not.toBeCalledWith(
      expect.objectContaining({
        createdAt: DATETIME,
      })
    );
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(1, {
      type: EventTypes.NotificationRemoved,
      payload: {
        id: "id",
      },
    });
    expect(eventEmitter.emit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: EventTypes.NotificationAdded,
        payload: expect.objectContaining({
          note: expect.objectContaining({
            id: "id",
          }),
        }),
      })
    );
    expect(eventEmitter.emit).not.toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: EventTypes.NotificationAdded,
        payload: expect.objectContaining({
          note: expect.objectContaining({
            createdAt: DATETIME,
          }),
        }),
      })
    );
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.offercredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
        linkedRequest: { accepted: false },
        connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
        updatedAt: new Date(),
      },
    ]);

    await keriaNotificationService.processOperation(operationRecord);

    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(markNotificationMock).toBeCalledWith("id");
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.presentcredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
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
    keriaNotificationService.onLongOperationSuccess(callback);

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

  test('Should retry connection when "Failed to fetch" error occurs when process operation', async () => {
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

  test("Can recover on-going long running operations related to IPEX", async () => {
    notificationStorage.findAllByQuery.mockResolvedValue([
      {
        route: NotificationRoute.ExnIpexApply,
        linkedRequest: { current: "offer-said" },
      },
      {
        route: NotificationRoute.MultiSigExn,
        linkedRequest: { current: "should-not-happen-skip-me" },
      },
      {
        route: NotificationRoute.ExnIpexGrant,
        linkedRequest: { current: "admit-said" },
      },
      {
        route: NotificationRoute.ExnIpexAgree,
        linkedRequest: { current: "grant-said" },
      },
    ]);

    await keriaNotificationService.syncIPEXReplyOperations();

    expect(notificationStorage.findAllByQuery).toBeCalledWith({
      $not: {
        currentLinkedRequest: undefined,
      },
    });
    expect(operationPendingStorage.save).toBeCalledTimes(3);
    expect(operationPendingStorage.save).toHaveBeenNthCalledWith(1, {
      id: "exchange.offer-said",
      recordType: OperationPendingRecordType.ExchangeOfferCredential,
    });
    expect(operationPendingStorage.save).toHaveBeenNthCalledWith(2, {
      id: "exchange.admit-said",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(operationPendingStorage.save).toHaveBeenNthCalledWith(3, {
      id: "exchange.grant-said",
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });
  });
});

describe("Handling of failed long running operations", () => {
  test("Should handle failed witness operations and exit early", async () => {
    operationsGetMock.mockResolvedValue({
      done: true,
      error: { code: 400 },
    });
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
        creationStatus: CreationStatus.FAILED,
      }
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationFailed,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "witness.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
    expect(identifierStorage.updateIdentifierMetadata).not.toBeCalledWith(
      "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      {
        creationStatus: CreationStatus.COMPLETE,
      }
    );
    expect(eventEmitter.emit).not.toBeCalledWith(
      expect.objectContaining({
        type: EventTypes.OperationComplete,
      })
    );
  });

  test("Should handle all other failed operation types as a failure", async () => {
    operationsGetMock.mockResolvedValue({
      done: true,
      error: { code: 400 },
    });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "group.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "group",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    await keriaNotificationService.processOperation(operationRecord);

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationFailed,
      payload: {
        opType: operationRecord.recordType,
        oid: "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      },
    });
    expect(operationPendingStorage.deleteById).toBeCalledWith(
      "group.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA"
    );
    expect(eventEmitter.emit).not.toBeCalledWith(
      expect.objectContaining({
        type: EventTypes.OperationComplete,
      })
    );
  });
});
