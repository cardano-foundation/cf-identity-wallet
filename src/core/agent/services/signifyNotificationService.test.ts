import { Agent } from "../agent";
import { ExchangeRoute, NotificationRoute } from "../agent.types";
import { IpexMessageStorage } from "../records";
import { ConnectionHistoryType } from "./connection.types";
import { CredentialStatus } from "./credentialService.types";
import { EventService } from "./eventService";
import { SignifyNotificationService } from "./signifyNotificationService";

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
const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const getCredentialMock = jest.fn();
const admitMock = jest.fn();
const submitAdmitMock = jest.fn();
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
    list: jest.fn(),
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

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
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

const signifyNotificationService = new SignifyNotificationService(
  agentServicesProps,
  notificationStorage as any,
  identifierStorage as any,
  operationPendingStorage as any,
  connectionStorage as any,
  ipexMessageStorage as any,
  credentialStorage as any
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
        markAcdc: jest.fn(),
      },
      signifyNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
        addPendingOperationToQueue: jest.fn(),
        markAcdcComplete: jest.fn(),
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

describe("Signify notification service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("callback should be called when there are KERI notifications", async () => {
    const callback = jest.fn();
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
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
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    groupGetRequestMock.mockResolvedValue([{ exn: { a: { gid: "id" } } }]);
    jest.useFakeTimers();
    for (const notif of notes) {
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(notificationStorage.save).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
  });

  test("Should admit if there is an existing credential", async () => {
    const callback = jest.fn();
    exchangesGetMock.mockResolvedValue(ipexMessageMock);
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
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
      await signifyNotificationService.processNotification(notif, callback);
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
    await signifyNotificationService.readNotification(notification.id);
    expect(notificationStorage.update).toBeCalledTimes(1);
  });

  test("Should throw error when read an invalid notification", async () => {
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(
      signifyNotificationService.readNotification("not-exist-noti-id")
    ).rejects.toThrowError(SignifyNotificationService.NOTIFICATION_NOT_FOUND);
  });

  test("can delete keri notification by ID", async () => {
    const id = "uuid";
    await signifyNotificationService.deleteNotificationRecordById(
      id,
      NotificationRoute.ExnIpexGrant
    );
    expect(notificationStorage.deleteById).toBeCalled();
    expect(markNotificationMock).toBeCalled();
  });

  test("Should not mark local notification when we delete notification", async () => {
    const id = "uuid";
    await signifyNotificationService.deleteNotificationRecordById(
      id,
      NotificationRoute.LocalAcdcRevoked
    );
    expect(notificationStorage.deleteById).toBeCalled();
    expect(markNotificationMock).not.toBeCalled();
  });

  test("Should skip if there is no valid multi-sig notification", async () => {
    const callback = jest.fn();
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
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(callback).toBeCalledTimes(0);
  });

  test("Should skip if there is a existed multi-sig", async () => {
    const callback = jest.fn();
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(true);
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
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(callback).toBeCalledTimes(0);
  });

  test("Should skip if there is a missing gid multi-sig notification", async () => {
    const callback = jest.fn();
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(true);
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
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(callback).toBeCalledTimes(0);
  });

  test("Should call update when unread a notification", async () => {
    const notification = {
      id: "id",
      read: true,
    };

    notificationStorage.findById = jest.fn().mockResolvedValue(notification);
    await signifyNotificationService.unreadNotification(notification.id);
    expect(notificationStorage.update).toBeCalledTimes(1);
  });

  test("Should throw error when unread an invalid notification", async () => {
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(
      signifyNotificationService.unreadNotification("not-exist-noti-id")
    ).rejects.toThrowError(SignifyNotificationService.NOTIFICATION_NOT_FOUND);
  });

  test("Should skip if there is a missing multi-sig identifier", async () => {
    const callback = jest.fn();
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
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(callback).toBeCalledTimes(0);
  });

  test("Should skip if notification route is /multisig/rpy", async () => {
    const callback = jest.fn();
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
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
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(markNotificationMock).toBeCalledWith(notes[0].i);
    expect(Agent.agent.multiSigs.joinAuthorization).toBeCalledTimes(1);
  });

  test("Should call grantAcdcFromAgree if notification route is /exn/ipex/agree", async () => {
    const callback = jest.fn();
    const notification = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/exn/ipex/agree",
          d: "string",
          m: "",
        },
      },
    ];
    getIpexMessageMetadataMock.mockResolvedValueOnce({});
    await signifyNotificationService.processNotification(
      notification[0],
      callback
    );

    expect(callback).toBeCalledTimes(0);
    expect(Agent.agent.ipexCommunications.grantAcdcFromAgree).toBeCalledWith(
      notification[0].a.d
    );
    expect(markNotificationMock).toBeCalledWith(notification[0].i);
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REQUEST_PRESENT", async () => {
    const callback = jest.fn();
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

    await signifyNotificationService.processNotification(
      notification,
      callback
    );
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      ipexMessageMock,
      ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
    );
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REVOKED", async () => {
    const callback = jest.fn();
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
    await signifyNotificationService.processNotification(
      notification,
      callback
    );
    expect(
      Agent.agent.signifyNotifications.addPendingOperationToQueue
    ).toBeCalledTimes(1);
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REQUEST_PRESENT_AGREE", async () => {
    const callback = jest.fn();
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

    await signifyNotificationService.processNotification(
      notification,
      callback
    );
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      ipexMessageMock,
      ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE
    );
  });

  test("Should skip if notification route is /multisig/exn and `e.exn.r` is not ipex/admit", async () => {
    const callback = jest.fn();
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
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

    for (const notif of notes) {
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should skip if notification route is /multisig/exn and the identifier is missing ", async () => {
    const callback = jest.fn();
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
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

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({});

    for (const notif of notes) {
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });

  test("Should skip if notification route is /multisig/exn and the credential exists ", async () => {
    const callback = jest.fn();
    Agent.agent.multiSigs.hasMultisig = jest.fn().mockResolvedValue(false);
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

    for (const notif of notes) {
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(markNotificationMock).toBeCalledTimes(1);
  });
});

describe("Long running operation tracker", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // We mock the setTimeout here so we can exit the while(true) loop
    jest.spyOn(global, "setTimeout").mockImplementation(() => {
      throw new Error("Force Exit");
    });
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
    const callback = jest.fn();
    operationPendingGetAllMock.mockResolvedValueOnce([
      {
        type: "OperationPendingRecord",
        id: "group.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "group",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
    identifierStorage.getIdentifierMetadata.mockResolvedValueOnce({
      signifyName: "signifyName",
    });
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(Agent.agent.multiSigs.endRoleAuthorization).toBeCalledWith(
      "signifyName"
    );
    expect(callback).toBeCalledTimes(1);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type witness", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const callback = jest.fn();
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
    operationPendingGetAllMock.mockResolvedValueOnce([
      {
        type: "OperationPendingRecord",
        id: "witness.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "witness",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      "AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
      {
        isPending: false,
      }
    );
    expect(callback).toBeCalledTimes(1);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type oobi", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const callback = jest.fn();
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
    operationPendingGetAllMock.mockResolvedValueOnce([
      {
        type: "OperationPendingRecord",
        id: "oobi.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "oobi",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(connectionStorage.update).toBeCalledWith({
      id: connectionMock.id,
      pending: false,
      createdAt: operationMock.response.dt,
    });
    expect(callback).toBeCalledTimes(1);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.receivecredential", async () => {
    const callback = jest.fn();
    operationPendingGetAllMock.mockResolvedValueOnce([
      {
        type: "OperationPendingRecord",
        id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "exchange.receivecredential",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
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

    notificationStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        _tags: {
          route: "/exn/ipex/grant",
          read: false,
          grantSaid: "EC5N3brbT8U0mMlWemYpRBnSYVpX00QPfK2ugYx-0isg",
        },
        type: "NotificationRecord",
        id: "AAVU53pb7_zTiRP9VHro0qr52cJC_S_bXCZ8GXUXok-n",
        createdAt: "2024-08-16T03:21:44.387Z",
        a: {
          r: "/exn/ipex/grant",
          d: "EC5N3brbT8U0mMlWemYpRBnSYVpX00QPfK2ugYx-0isg",
          m: "",
        },
        route: "/exn/ipex/grant",
        read: false,
        connectionId: "EBRg2Ur0JYi92jP0r0ZEO385sWr_8KNMqRIsv9s2JUFI",
        linkedGroupRequests: {
          "EIzCD7k_SlEWubN5RL_Xxg1FucTYiOKpCE-OAlQm8VkT": true,
        },
        grantSaid: "EC5N3brbT8U0mMlWemYpRBnSYVpX00QPfK2ugYx-0isg",
        updatedAt: "2024-08-16T03:21:57.455Z",
      },
    ]);

    await signifyNotificationService.deleteNotificationRecordById(
      "AAVU53pb7_zTiRP9VHro0qr52cJC_S_bXCZ8GXUXok-n",
      NotificationRoute.ExnIpexGrant
    );

    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(Agent.agent.ipexCommunications.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.CONFIRMED
    );
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should handle long operations with type exchange.revokecredential", async () => {
    const callback = jest.fn();
    const credentialIdMock = "credentialId";
    operationPendingGetAllMock.mockResolvedValue([
      {
        type: "OperationPendingRecord",
        id: "exchange.revokecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "exchange.revokecredential",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
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
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(Agent.agent.ipexCommunications.markAcdc).toBeCalledWith(
      credentialIdMock,
      CredentialStatus.REVOKED
    );
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).toBeCalledWith(grantExchange, ConnectionHistoryType.CREDENTIAL_REVOKED);
    expect(notificationStorage.save).toBeCalledTimes(1);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should not markAcdc if the credentialMetadata's status is revoked", async () => {
    const callback = jest.fn();
    const credentialIdMock = "credentialId";
    operationPendingGetAllMock.mockResolvedValue([
      {
        type: "OperationPendingRecord",
        id: "exchange.revokecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "exchange.revokecredential",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
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
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(Agent.agent.ipexCommunications.markAcdc).not.toBeCalled();
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should not markAcdc if the credential.status.s status is not 1", async () => {
    const callback = jest.fn();
    const credentialIdMock = "credentialId";
    operationPendingGetAllMock.mockResolvedValue([
      {
        type: "OperationPendingRecord",
        id: "exchange.revokecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "exchange.revokecredential",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
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
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(Agent.agent.ipexCommunications.markAcdc).not.toBeCalled();
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).not.toBeCalled();
    expect(notificationStorage.save).not.toBeCalled();
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("ExchangeReceiveCredential operations must have an exchange route of /ipex/admit", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const callback = jest.fn();
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
    operationPendingGetAllMock.mockResolvedValueOnce([
      {
        type: "OperationPendingRecord",
        id: "exchange.receivecredential.AOCUvGbpidkplC7gAoJOxLgXX1P2j4xlWMbzk3gM8JzA",
        createdAt: new Date("2024-08-01T10:36:17.814Z"),
        recordType: "exchange.receivecredential",
        updatedAt: new Date("2024-08-01T10:36:17.814Z"),
      },
    ]);
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
    try {
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(operationsGetMock).toBeCalledTimes(1);
    expect(Agent.agent.ipexCommunications.markAcdc).toBeCalledTimes(0);
    expect(operationPendingStorage.deleteById).toBeCalledTimes(1);
  });

  test("Should call setTimeout listening for pending operations if Keria is offline", async () => {
    const callback = jest.fn();
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
      await signifyNotificationService.onSignifyOperationStateChanged(callback);
    } catch (error) {
      expect((error as Error).message).toBe("Force Exit");
    }
    expect(setTimeout).toBeCalledTimes(1);
    expect(operationsGetMock).not.toBeCalled();
  });
});
