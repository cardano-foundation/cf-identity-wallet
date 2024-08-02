import { Agent } from "../agent";
import { IpexMessageStorage } from "../records";
import { ConnectionHistoryType } from "./connection.types";
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
const getCredentialMock = jest.fn();
const admitMock = jest.fn();
const submitAdmitMock = jest.fn();

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
    get: jest.fn().mockResolvedValue(ipexMessageMock),
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
});

const getIpexMessageMetadataMock = jest.fn();
const ipexMessageStorage = jest.mocked({
  createIpexMessageRecord: jest.fn(),
  getIpexMessageMetadata: getIpexMessageMetadataMock,
  getIpexMessageMetadataByConnectionId: jest.fn(),
});

const operationPendingStorage = jest.mocked({});

const signifyNotificationService = new SignifyNotificationService(
  agentServicesProps,
  notificationStorage as any,
  identifierStorage as any,
  operationPendingStorage as any,
  connectionStorage as any,
  ipexMessageStorage as any
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
      multiSigs: { hasMultisig: jest.fn(), joinAuthorization: jest.fn() },
      ipexCommunications: {
        grantAcdcFromAgree: jest.fn(),
        createLinkedIpexMessageRecord: jest.fn(),
      },
    },
  },
}));

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
    getCredentialMock.mockRejectedValue(new Error());
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
    await signifyNotificationService.deleteNotificationRecordById(id);
    expect(notificationStorage.deleteById).toBeCalled();
    expect(markNotificationMock).toBeCalled();
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

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_ISSUANCE", async () => {
    const callback = jest.fn();
    notificationStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    const notification = {
      i: "string",
      dt: "string",
      r: false,
      a: {
        r: "/exn/ipex/grant",
        d: "string",
        m: "",
      },
    };
    getCredentialMock.mockRejectedValueOnce(new Error());
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "signifyName",
    });

    await signifyNotificationService.processNotification(
      notification,
      callback
    );
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      ipexMessageMock,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_UPDATE", async () => {
    const callback = jest.fn();
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
    admitMock.mockResolvedValue([{}, ["sigs"], "end"]);
    getCredentialMock.mockResolvedValue(acdcMock);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "signifyName",
    });

    await signifyNotificationService.processNotification(
      notification,
      callback
    );
    expect(
      Agent.agent.ipexCommunications.createLinkedIpexMessageRecord
    ).toHaveBeenCalledWith(
      ipexMessageMock,
      ConnectionHistoryType.CREDENTIAL_UPDATE
    );
  });

  test("Should call createLinkedIpexMessageRecord with CREDENTIAL_REQUEST_PRESENT_AGREE", async () => {
    const callback = jest.fn();
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
});
