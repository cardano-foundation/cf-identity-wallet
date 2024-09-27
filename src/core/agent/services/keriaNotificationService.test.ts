import { Agent } from "../agent";
import { ExchangeRoute, MiscRecordId, NotificationRoute } from "../agent.types";
import { IpexMessageStorage, NotificationStorage } from "../records";
import { OperationPendingRecord } from "../records/operationPendingRecord";
import { ConnectionHistoryType } from "./connection.types";
import { CredentialStatus } from "./credentialService.types";
import { CoreEventEmitter } from "../event";
import { KeriaNotificationService } from "./keriaNotificationService";
import { EventTypes } from "../event.types";
import { deleteNotificationRecordById } from "./utils";

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

const ipexMessageMock = {
  exn: {
    v: "KERI10JSON000516_",
    t: "exn",
    d: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
    i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
    p: "",
    dt: "2024-07-30T04:19:55.801000+00:00",
    r: "/ipex/grant",
    q: {},
    a: {
      m: "",
      i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
    },
    e: {
      acdc: {
        d: "EEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn",
        i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "ELHCh_X2aw7C-aYesOM4La23a5lsoNuJDuCsJuxwO2nq",
          i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
          dt: "2024-07-30T04:19:55.348000+00:00",
          attendeeName: "ccc",
        },
      },
      iss: {
        t: "iss",
        d: "EHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
        i: "EEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn",
        s: "0",
        dt: "2024-07-30T04:19:55.348000+00:00",
      },
      d: "EKBPPnWxYw2I5CtQSyhyn5VUdSTJ61qF_-h-NwmFRkIF",
    },
  },
  pathed: {
    acdc: "-IABEEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn0AAAAAAAAAAAAAAAAAAAAAAAEHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
    iss: "-VAS-GAB0AAAAAAAAAAAAAAAAAAAAAAAEEO0xKzC8FOAXV-JgFZGgb0aIT2A3cPXPt9_0l_qcGM9",
    anc: "-AABAACBlQqbI_qNpKYkzIog6tauSgt0XufBvGtrumfbnhSInFjSwnaIqZi353QT-c1W_gE9KIz3rgX5QNNWLcqA7bcM",
  },
};

const credentialMetadataMock = {
  type: "CredentialMetadataRecord",
  id: "EJuFvMGiT3uhEXtd7UQlkAm4N_MymeHfhkgnOgPhK0cJ",
  isArchived: false,
  isDeleted: false,
  createdAt: "2024-08-09T04:21:18.311Z",
  issuanceDate: "2024-08-09T04:21:12.575Z",
  credentialType: "Qualified vLEI Issuer Credential",
  status: CredentialStatus.CONFIRMED,
  connectionId: "EP0fEaRWZDR7caQbdserTOWlC_4trvqB1tzbr2xVo3a4",
  schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  updatedAt: "2024-08-09T04:21:19.695Z",
};

const grantIpexMessageMock = {
  exn: {
    v: "KERI10JSON000516_",
    t: "exn",
    d: "EJ1jbI8vTFCEloTfSsZkBpV0bUJnhGVyak5q-5IFIglL",
    i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
    p: "",
    dt: "2024-07-30T04:19:55.801000+00:00",
    r: "/ipex/grant",
    q: {},
    a: {
      m: "",
      i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
    },
    e: {
      acdc: {
        d: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
        i: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
        s: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
        a: {
          d: "ELHCh_X2aw7C-aYesOM4La23a5lsoNuJDuCsJuxwO2nq",
          i: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
          dt: "2024-07-30T04:19:55.348000+00:00",
          attendeeName: "ccc",
        },
      },
      iss: {
        t: "iss",
        d: "EHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
        i: "EEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn",
        s: "0",
        dt: "2024-07-30T04:19:55.348000+00:00",
      },
      d: "EKBPPnWxYw2I5CtQSyhyn5VUdSTJ61qF_-h-NwmFRkIF",
    },
  },
  pathed: {
    acdc: "-IABEEqfWy-6jx_FG0RNuNxZBh_jq6Lq1OPuvX5m3v1Bzxdn0AAAAAAAAAAAAAAAAAAAAAAAEHStOgwJku_Ln-YN2ohgWUH-CI07SyJnFppSbF8kG4PO",
    iss: "-VAS-GAB0AAAAAAAAAAAAAAAAAAAAAAAEEO0xKzC8FOAXV-JgFZGgb0aIT2A3cPXPt9_0l_qcGM9",
    anc: "-AABAACBlQqbI_qNpKYkzIog6tauSgt0XufBvGtrumfbnhSInFjSwnaIqZi353QT-c1W_gE9KIz3rgX5QNNWLcqA7bcM",
  },
};

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
  signifyName: "uuid-here",
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
const ipexMessageStorage = jest.mocked({
  createIpexMessageRecord: jest.fn(),
  getIpexMessageMetadata: getIpexMessageMetadataMock,
  getIpexMessageMetadataByConnectionId: jest.fn(),
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
  ipexMessageStorage as any,
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

const acdcMock = {
  sad: {
    a: { LEI: "5493001KJTIIGC8Y1R17" },
    d: "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli",
    i: "EIpeOFh268oRJTM4vNNoQvMWw-NBUPDv1NqYbx6Lc1Mk",
    ri: "EOIj7V-rqu_Q9aGSmPfviBceEtRk1UZBN5H2P_L-Hhx5",
    s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    v: "ACDC10JSON000197_",
  },
  schema: {
    title: "Qualified vLEI Issuer Credential",
    description: "vLEI Issuer Description",
    version: "1.0.0",
    credentialType: "QualifiedvLEIIssuervLEICredential",
  },
  status: {
    s: "0",
    dt: new Date().toISOString(),
  },
};

eventEmitter.emit = jest.fn();

describe("Signify notification service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Emitting an event when there are KERI notifications", async () => {
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/icp",
          d: "string",
          m: "",
        },
      },
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
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/exn/ipex/grant",
          d: "string",
          m: "",
        },
      },
    ];
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce(null);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({});
    notificationStorage.save = jest.fn().mockReturnValue({
      id: "0AC0W27tnnd2WyHWUh-368EI",
      createdAt: new Date("2024-09-20T02:51:24.930Z"),
      a: {
        r: "/exn/ipex/grant",
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
    expect(notificationStorage.save).toBeCalledTimes(2);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.NotificationAdded,
      payload: {
        keriaNotif: {
          a: {
            d: "EBcuMc13wJx0wbmxdWqqjoD5V_c532dg2sO-fvISrrMH",
            m: "",
            r: "/exn/ipex/grant",
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
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/exn/ipex/grant",
          d: "string",
          m: "",
        },
      },
    ];
    credentialStorage.getCredentialMetadata.mockResolvedValue(
      credentialMetadataMock
    );
    getCredentialMock.mockResolvedValue(acdcMock);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "signifyName",
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
    groupGetRequestMock.mockResolvedValue([]);
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/icp",
          d: "not-found-said",
          m: "",
        },
      },
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/rpy",
          d: "not-found-said",
          m: "",
        },
      },
    ];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should skip if there is a existed multi-sig", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(true);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/icp",
          d: "d",
          m: "",
        },
      },
    ];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should skip if there is a missing gid multi-sig notification", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(true);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    groupGetRequestMock.mockResolvedValue([{ exn: { a: {} } }]);
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/icp",
          d: "no-gid-said",
          m: "",
        },
      },
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/rpy",
          d: "not-found-said",
          m: "",
        },
      },
    ];
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
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    groupGetRequestMock.mockResolvedValue([{ exn: { a: {} } }]);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({});
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/rpy",
          d: "not-found-said",
          m: "",
        },
      },
    ];
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(eventEmitter.emit).toBeCalledTimes(0);
  });

  test("Should skip if notification route is /multisig/rpy", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);

    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/rpy",
          d: "string",
          m: "",
        },
      },
    ];

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
    groupGetRequestMock.mockResolvedValue([multisigNotificationExn]);
    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledWith(notes[0].i);
    expect(multiSigs.joinAuthorization).toBeCalledTimes(1);
  });

  test("Should call grantAcdcFromAgree if notification route is /exn/ipex/agree", async () => {
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    const notification = {
      i: "string",
      dt: "string",
      r: false,
      a: {
        r: "/exn/ipex/agree",
        d: "string",
        m: "",
      },
    };
    getIpexMessageMetadataMock.mockRejectedValueOnce(
      new Error(IpexMessageStorage.IPEX_MESSAGE_METADATA_RECORD_MISSING)
    );

    notificationStorage.save = jest.fn().mockResolvedValue({
      id: "string",
      a: { r: "/exn/ipex/agree", d: "string", m: "" },
      read: false,
      route: "/exn/ipex/agree",
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      createdAt: new Date(),
    });

    await keriaNotificationService.processNotification(notification);
    expect(
      ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      ipexMessageMock,
      ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE
    );
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(ipexCommunications.grantAcdcFromAgree).toBeCalledWith(
      notification.i
    );
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REQUEST_PRESENT", async () => {
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    const notification = {
      i: "string",
      dt: "string",
      r: false,
      a: {
        r: "/exn/ipex/apply",
        d: "string",
        m: "",
      },
    };
    getIpexMessageMetadataMock.mockRejectedValueOnce(
      new Error(IpexMessageStorage.IPEX_MESSAGE_METADATA_RECORD_MISSING)
    );

    await keriaNotificationService.processNotification(notification);
    expect(
      ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      ipexMessageMock,
      ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
    );
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REVOKED", async () => {
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    const notification = {
      i: "string2",
      dt: "string",
      r: false,
      a: {
        r: "/exn/ipex/grant",
        d: "string",
        m: "",
      },
    };
    credentialStorage.getCredentialMetadata.mockResolvedValue(
      credentialMetadataMock
    );
    admitMock.mockResolvedValue([{}, ["sigs"], "end"]);
    getCredentialMock.mockResolvedValue(acdcMock);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "signifyName",
    });
    submitAdmitMock.mockResolvedValueOnce({
      name: "name",
      done: true,
    });

    keriaNotificationService["pendingOperations"] = [];
    const pendingOperationsDescriptor = Object.getOwnPropertyDescriptor(
      keriaNotificationService,
      "pendingOperations"
    );

    const pendingOperations = pendingOperationsDescriptor?.value;
    await keriaNotificationService.processNotification(notification);
    expect(pendingOperations.length).toBe(1);
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should skip if notification route is /multisig/exn and `e.exn.r` is not ipex/admit, ipex/offer, ipex/grant", async () => {
    multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/exn",
          d: "string",
          m: "",
        },
      },
    ];

    exchangesGetMock
      .mockResolvedValueOnce({
        exn: {
          e: {
            exn: {
              p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
              r: "/ipex/apply",
            },
            d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPsvx",
          },
        },
        pathed: {},
      })
      .mockResolvedValueOnce({ exn: { d: "d" } });

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

    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/exn",
          d: "string",
          m: "",
        },
      },
    ];

    exchangesGetMock
      .mockResolvedValueOnce({
        exn: {
          e: {
            exn: {
              p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
              r: "/ipex/apply",
            },
            d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPsvx",
          },
        },
        pathed: {},
      })
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

    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/exn",
          d: "string",
          m: "",
        },
      },
    ];

    const acdc = {
      sad: {
        a: { LEI: "5493001KJTIIGC8Y1R17" },
        d: "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli",
        i: "EIpeOFh268oRJTM4vNNoQvMWw-NBUPDv1NqYbx6Lc1Mk",
        ri: "EOIj7V-rqu_Q9aGSmPfviBceEtRk1UZBN5H2P_L-Hhx5",
        s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
        v: "ACDC10JSON000197_",
      },
      schema: {
        title: "Qualified vLEI Issuer Credential",
        description: "vLEI Issuer Description",
        version: "1.0.0",
        credentialType: "QualifiedvLEIIssuervLEICredential",
      },
      status: {
        s: "0",
        dt: new Date().toISOString(),
      },
    };

    getCredentialMock.mockResolvedValue(acdc);

    exchangesGetMock
      .mockResolvedValueOnce({
        exn: {
          e: {
            exn: {
              p: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
              r: "/ipex/apply",
            },
            d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPsvx",
          },
        },
        pathed: {},
      })
      .mockResolvedValueOnce({ exn: { d: "d" } });

    for (const notif of notes) {
      await keriaNotificationService.processNotification(notif);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Original grant is linked to first received /multisig/exn admit message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);
    const notif = {
      i: "string",
      dt: "string",
      r: false,
      a: {
        r: "/multisig/exn",
        d: "string",
        m: "",
      },
    };

    exchangesGetMock
      .mockResolvedValueOnce({
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
              r: "/ipex/admit",
              q: {},
              a: {
                i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
                m: "",
              },
              e: {},
            },
            d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
          },
        },
        pathed: {},
      })
      .mockResolvedValueOnce(grantIpexMessageMock);

    getCredentialMock.mockResolvedValue(undefined);
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
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
      },
    ]);

    await keriaNotificationService.processNotification(notif);

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: new Date(),
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
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Auto-joins /multisig/exn admit message and links to grant if we have joined a previous but different admit message, and no notification record is created", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(identifierMetadataRecordProps);

    const noti = {
      i: "string",
      dt: "string",
      r: false,
      a: {
        r: "/multisig/exn",
        d: "string",
        m: "",
      },
    };

    exchangesGetMock
      .mockResolvedValueOnce({
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
              r: "/ipex/admit",
              q: {},
              a: {
                i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
                m: "",
              },
              e: {},
            },
            d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
          },
        },
        pathed: {},
      })
      .mockResolvedValueOnce(grantIpexMessageMock);

    getCredentialMock.mockResolvedValue(undefined);
    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
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

    await keriaNotificationService.processNotification(noti);

    expect(ipexCommunications.acceptAcdcFromMultisigExn).toBeCalledWith(
      "ELW97_QXT2MWtsmWLCSR8RBzH-dcyF2gTJvt72I0wEFO"
    );
    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
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
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(notificationStorage.save).toBeCalledTimes(0);
  });

  test("Links /multisig/exn admit message to grant but does not join if admit by SAID already joined, and no notification record is created", async () => {
    Agent.agent.identifiers.getIdentifier = jest
      .fn()
      .mockResolvedValueOnce(identifierMetadataRecordProps);

    const noti = {
      i: "string",
      dt: "string",
      r: false,
      a: {
        r: "/multisig/exn",
        d: "string",
        m: "",
      },
    };

    exchangesGetMock
      .mockResolvedValueOnce({
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
              r: "/ipex/admit",
              q: {},
              a: {
                i: "EJ84hiNC0ts71HARE1ZkcnYAFJP0s-RiLNyzupnk7edn",
                m: "",
              },
              e: {},
            },
            d: "EE8_Xc0ZUh_sUJLtmBpVSEr-RFS2mRUIpFyL-pmvtPvx",
          },
        },
        pathed: {},
      })
      .mockResolvedValueOnce(grantIpexMessageMock);

    getCredentialMock.mockResolvedValue(undefined);
    const dt = new Date().toISOString();
    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        type: "NotificationRecord",
        id: "id",
        createdAt: dt,
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

    await keriaNotificationService.processNotification(noti);

    expect(ipexCommunications.acceptAcdcFromMultisigExn).not.toBeCalled();

    expect(notificationStorage.update).toBeCalledWith({
      type: "NotificationRecord",
      id: "id",
      createdAt: dt,
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
    expect(markNotificationMock).toBeCalledTimes(1);
    expect(notificationStorage.save).toBeCalledTimes(0);
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
    };
    connectionStorage.findById.mockResolvedValueOnce(connectionMock);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "oobi",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    await keriaNotificationService.processOperation(operationRecord);
    expect(connectionStorage.update).toBeCalledWith({
      id: connectionMock.id,
      pending: false,
      createdAt: operationMock.response.dt,
    });
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
      signifyName: "764c965c-d997-4842-b940-aebd514fce42",
      signifyOpName: "group.EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
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
    const callback = jest.fn();
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
      signifyName: "764c965c-d997-4842-b940-aebd514fce42",
      signifyOpName: "group.EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await keriaNotificationService.processOperation(operationRecord);
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.presentcredential", async () => {
    const callback = jest.fn();
    const credentialIdMock = "credentialId";
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexAgree,
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
      id: "exchange.presentcredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.presentcredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      type: "IdentifierMetadataRecord",
      id: "EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      displayName: "holder",
      signifyName: "764c965c-d997-4842-b940-aebd514fce42",
      signifyOpName: "group.EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await keriaNotificationService.processOperation(operationRecord);
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
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
      signifyName: "764c965c-d997-4842-b940-aebd514fce42",
      signifyOpName: "group.EC1cyV3zLnGs4B9AYgoGNjXESyQZrBWygz3jLlRD30bR",
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

    await keriaNotificationService.processOperation(operationRecord);
    expect(credentialService.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.CONFIRMED
    );
    expect(notificationStorage.deleteById).toBeCalledWith("id");
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.revokecredential", async () => {
    const credentialIdMock = "credentialId";
    getCredentialMock.mockResolvedValue({
      id: "id",
      schema: {
        title: "title",
      },
      status: {
        s: "1",
      },
    });
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce(
      credentialMetadataMock
    );
    const grantExchange = {
      exn: {
        r: ExchangeRoute.IpexGrant,
        e: {
          acdc: {
            d: credentialIdMock,
          },
        },
      },
    };
    signifyClient
      .exchanges()
      .get.mockResolvedValueOnce({
        exn: {
          r: ExchangeRoute.IpexAdmit,
          p: "p",
        },
      })
      .mockResolvedValueOnce(grantExchange);
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.revokecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.revokecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    await keriaNotificationService.processOperation(operationRecord);
    expect(credentialService.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.REVOKED
    );
    expect(ipexCommunications.createLinkedIpexMessageRecord).toBeCalledWith(
      grantExchange,
      ConnectionHistoryType.CREDENTIAL_REVOKED
    );
    expect(notificationStorage.save).toBeCalledTimes(1);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should not markAcdc if the credentialMetadata's status is revoked", async () => {
    const credentialIdMock = "credentialId";
    getCredentialMock.mockResolvedValue({
      id: "id",
      schema: {
        title: "title",
      },
      status: {
        s: "1",
      },
    });
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce({
      ...credentialMetadataMock,
      status: CredentialStatus.REVOKED,
    });
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
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.revokecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.revokecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    await keriaNotificationService.processOperation(operationRecord);
    expect(credentialService.markAcdc).not.toBeCalled();
    expect(ipexCommunications.createLinkedIpexMessageRecord).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should not markAcdc if the credential.status.s status is not 1", async () => {
    const credentialIdMock = "credentialId";
    getCredentialMock.mockResolvedValue({
      id: "id",
      schema: {
        title: "title",
      },
      status: {
        s: "0",
      },
    });
    credentialStorage.getCredentialMetadata.mockResolvedValueOnce(
      credentialMetadataMock
    );
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
          e: {
            acdc: {
              d: credentialIdMock,
            },
          },
        },
      });
    const operationRecord = {
      type: "OperationPendingRecord",
      id: "exchange.revokecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      createdAt: new Date("2024-08-01T10:36:17.814Z"),
      recordType: "exchange.revokecredential",
      updatedAt: new Date("2024-08-01T10:36:17.814Z"),
    } as OperationPendingRecord;
    await keriaNotificationService.processOperation(operationRecord);
    expect(credentialService.markAcdc).not.toBeCalled();
    expect(ipexCommunications.createLinkedIpexMessageRecord).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(0);
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
    signifyClient.exchanges().get.mockResolvedValueOnce({
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
});
