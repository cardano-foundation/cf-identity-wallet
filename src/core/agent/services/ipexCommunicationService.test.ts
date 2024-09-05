import { EventService } from "./eventService";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { Agent } from "../agent";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";
import { CredentialStatus } from "./credentialService.types";
import { AcdcEventTypes } from "../agent.types";

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

const operationPendingStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const multisigService = jest.mocked({
  multisigAdmit: jest.fn().mockResolvedValue({ name: "opName", done: true }),
});

let credentialListMock = jest.fn();
let credentialGetMock = jest.fn();
const identifierListMock = jest.fn();

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
const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const submitAdmitMock = jest.fn().mockResolvedValue({
  name: "opName",
  done: true,
});

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifierListMock,
    get: jest.fn(),
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: jest.fn(),
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
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn().mockResolvedValue(["admit", "sigs", "aend"]),
    submitAdmit: submitAdmitMock,
    offer: ipexOfferMock,
    submitOffer: jest.fn(),
    grant: ipexGrantMock,
    submitGrant: jest.fn(),
  }),
  credentials: () => ({
    list: credentialListMock,
    get: credentialGetMock,
  }),
  exchanges: () => ({
    get: getExchangeMock,
    send: jest.fn(),
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
});

jest.mock("signify-ts", () => ({
  Serder: jest.fn().mockImplementation(() => {
    return {};
  }),
}));

const eventService = new EventService();

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService,
};

const resolveOobiMock = jest.fn();
jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        resolveOobi: () => resolveOobiMock(),
      },
      keriaNotifications: {
        deleteNotificationRecordById: jest.fn(),
        addPendingOperationToQueue: jest.fn(),
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

const ipexCommunicationService = new IpexCommunicationService(
  agentServicesProps,
  identifierStorage as any,
  credentialStorage as any,
  notificationStorage as any,
  ipexMessageRecordStorage as any,
  operationPendingStorage as any,
  multisigService as any
);

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
const credentialMetadataMock = {
  type: "CredentialMetadataRecord",
  id: "EJuFvMGiT3uhEXtd7UQlkAm4N_MymeHfhkgnOgPhK0cJ",
  isArchived: false,
  isDeleted: false,
  createdAt: "2024-08-09T04:21:18.311Z",
  issuanceDate: "2024-08-09T04:21:12.575Z",
  credentialType: "Qualified vLEI Issuer Credential",
  status: CredentialStatus.PENDING,
  connectionId: "EP0fEaRWZDR7caQbdserTOWlC_4trvqB1tzbr2xVo3a4",
  schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  updatedAt: "2024-08-09T04:21:19.695Z",
};
describe("Ipex communication service of agent", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });

  test("can accept ACDC", async () => {
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

    getExchangeMock = jest.fn().mockReturnValue(grantIpexMessageMock);

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    schemaGetMock.mockResolvedValue({ title: "title" });

    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue({
      id: "id",
    });
    eventService.emit = jest.fn();

    await ipexCommunicationService.acceptAcdc(id);

    const credentialMock = {
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      credentialType: "title",
      id: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
      isArchived: false,
      issuanceDate: "2024-07-30T04:19:55.348Z",
      schema: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
      status: "pending",
    };
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith(
      credentialMock
    );
    expect(eventService.emit).toHaveBeenCalledWith({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        credential: credentialMock,
        status: CredentialStatus.PENDING,
      },
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(
      Agent.agent.keriaNotifications.addPendingOperationToQueue
    ).toBeCalledTimes(1);
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith(
      expect.objectContaining({
        historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
      })
    );
    expect(
      Agent.agent.keriaNotifications.deleteNotificationRecordById
    ).toBeCalledWith(id, "/exn/ipex/grant");
  });

  test("cannot accept ACDC if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  // This logic must change if we are accepting presentations later.
  test("cannot accept ACDC if identifier is not locally stored", async () => {
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

  test("cannot mark credential as confirmed if metadata is missing", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "id",
        },
      },
    ]);
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue(null);
    await expect(
      ipexCommunicationService.markAcdc(id, CredentialStatus.CONFIRMED)
    ).rejects.toThrowError(
      IpexCommunicationService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
  });

  test("Can mark credential as confirmed", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "id",
        },
      },
    ]);
    const pendingCredentialMock = {
      id: "id",
      createdAt: new Date(),
      issuanceDate: "",
      credentialType: "",
      status: CredentialStatus.PENDING,
      connectionId: "connection-id",
    };
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(pendingCredentialMock);
    await ipexCommunicationService.markAcdc(id, CredentialStatus.CONFIRMED);
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith(
      pendingCredentialMock.id,
      {
        ...pendingCredentialMock,
        status: CredentialStatus.CONFIRMED,
      }
    );
  });

  test("Can mark credential as revoked", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "id",
        },
      },
    ]);
    const pendingCredentialMock = {
      id: "id",
      createdAt: new Date(),
      issuanceDate: "",
      credentialType: "",
      status: CredentialStatus.PENDING,
      connectionId: "connection-id",
    };
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(pendingCredentialMock);
    await ipexCommunicationService.markAcdc(id, CredentialStatus.REVOKED);
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith(
      pendingCredentialMock.id,
      {
        ...pendingCredentialMock,
        status: CredentialStatus.REVOKED,
      }
    );
  });

  test("Should throw an error when KERIA is offline", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    await expect(
      ipexCommunicationService.acceptAcdc("id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
  });

  test("can offer Keri Acdc when received the ipex apply", async () => {
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

    getExchangeMock = jest.fn().mockReturnValue({
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
      signifyName: "abc123",
    });
    ipexOfferMock.mockResolvedValue(["offer", "sigs", "gend"]);
    await ipexCommunicationService.offerAcdcFromApply(noti, {});
    expect(ipexOfferMock).toBeCalledWith({
      senderName: "abc123",
      recipient: "i",
      acdc: expect.anything(),
      applySaid: "d",
    });
    expect(
      Agent.agent.keriaNotifications.deleteNotificationRecordById
    ).toBeCalledWith(id, undefined);
  });

  test("can not offer Keri Acdc if aid is not existed", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "uuid";
    const date = new Date().toISOString();
    const noti = {
      id,
      createdAt: date,
      a: {
        d: "keri",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    getExchangeMock = jest.fn().mockReturnValue({
      exn: {
        a: {
          s: "schemaSaid",
          i: "ai",
        },
        i: "i",
      },
    });
    credentialListMock = jest.fn().mockReturnValue([{}]);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValue(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );
    await expect(
      ipexCommunicationService.offerAcdcFromApply(noti, {})
    ).rejects.toThrowError(
      IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
    );
  });

  test("can grant Keri Acdc when received the ipex agree", async () => {
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
    credentialGetMock = jest.fn().mockReturnValue({});
    identifierStorage.getIdentifierMetadata = jest.fn().mockReturnValue({
      signifyName: "abc123",
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

  test("can not grant Keri Acdc if aid is not existed", async () => {
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

  test("can not grant Keri Acdc if acdc is not existed", async () => {
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

  test("can get matching credential for apply", async () => {
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
    getExchangeMock = jest.fn().mockResolvedValue(mockExchange);
    const noti = {
      id: notiId,
      createdAt: new Date("2024-04-29T11:01:04.903Z").toISOString(),
      a: {
        d: "saidForUuid",
      },
      connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
      read: true,
    };
    schemaGetMock.mockResolvedValue({
      title: "Qualified vLEI Issuer Credential",
      description: "Qualified vLEI Issuer Credential",
    });
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

  test("can create linked ipex message record", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const schemaMock = { title: "title" };
    schemaGetMock.mockResolvedValueOnce(schemaMock);
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      grantIpexMessageMock,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: grantIpexMessageMock.exn.d,
      credentialType: schemaMock.title,
      content: grantIpexMessageMock,
      connectionId: grantIpexMessageMock.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
    });

    schemaGetMock.mockResolvedValueOnce(schemaMock);
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
      grantIpexMessageMock,
      ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE
    );
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: grantIpexMessageMock.exn.d,
      credentialType: schemaMock.title,
      content: grantIpexMessageMock,
      connectionId: grantIpexMessageMock.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE,
    });
    expect(schemaGetMock).toBeCalledTimes(2);
    expect(resolveOobiMock).toBeCalledTimes(2);
  });

  test("Should throw error if schemas.get has an unexpected error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    schemaGetMock.mockRejectedValueOnce(new Error("Unknown error"));
    await expect(
      ipexCommunicationService.createLinkedIpexMessageRecord(
        grantIpexMessageMock,
        ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
      )
    ).rejects.toThrowError(new Error("Unknown error"));
  });

  test("cannot get matching credential for apply if cannot get the schema", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const notiId = "notiId";
    getExchangeMock = jest.fn().mockResolvedValue({
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
      ipexCommunicationService.offerAcdcFromApply(noti, {})
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      ipexCommunicationService.grantAcdcFromAgree(noti.a.d)
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      ipexCommunicationService.getIpexApplyDetails(noti)
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
  });

  test("can accept ACDC from multisig exn", async () => {
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
        "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
      updatedAt: new Date(),
    });

    getExchangeMock
      .mockReturnValueOnce({
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
      .mockReturnValueOnce(grantIpexMessageMock);

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

    schemaGetMock.mockResolvedValue({ title: "title" });
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

    await ipexCommunicationService.acceptAcdc(id);

    expect(notificationStorage.deleteById).toBeCalledTimes(0);
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(
      Agent.agent.keriaNotifications.addPendingOperationToQueue
    ).toBeCalledTimes(1);
  });

  test("can accept ACDC and update linkedGroupRequests when FIRST of multisig joins", async () => {
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
    getExchangeMock.mockReturnValueOnce(grantIpexMessageMock);

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
    schemaGetMock.mockResolvedValue({ title: "title" });

    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataMock);

    multisigService.multisigAdmit = jest.fn().mockResolvedValue({
      op: { name: "opName", done: false },
      exnSaid: "exnSaid",
    });

    eventService.emit = jest.fn();

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
        exnSaid: true,
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });

    const credentialMock = {
      connectionId: "EC9bQGHShmp2Juayqp0C5XcheBiHyc1p54pZ_Op-B95x",
      credentialType: "title",
      id: "EAe_JgQ636ic-k34aUQMjDFPp6Zd350gEsQA6HePBU5W",
      isArchived: false,
      issuanceDate: "2024-07-30T04:19:55.348Z",
      schema: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
      status: "pending",
    };
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith(
      credentialMock
    );

    expect(eventService.emit).toHaveBeenCalledWith({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        credential: credentialMock,
        status: CredentialStatus.PENDING,
      },
    });
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(
      Agent.agent.keriaNotifications.addPendingOperationToQueue
    ).toBeCalledTimes(1);
    expect(notificationStorage.deleteById).toBeCalledTimes(0);
  });

  test("can accept ACDC from multisig exn and update linkedGroupRequests when SECOND of multisig joins", async () => {
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
        "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": false,
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    };
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValue(notificationRecord);

    getExchangeMock
      .mockReturnValueOnce({
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
      .mockReturnValueOnce(grantIpexMessageMock);

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

    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataMock);

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
        "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw": true,
      },
      connectionId: "EEFjBBDcUM2IWpNF7OclCme_bE76yKE3hzULLzTOFE8E",
    });
  });

  test("can accept ACDC from multisig exn when existing credential", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";
    getExchangeMock
      .mockReturnValueOnce({
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
      .mockReturnValueOnce(grantIpexMessageMock);
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

  test("cannot accept ACDC from multisig exn if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
    notificationStorage.findById.mockResolvedValueOnce(null);

    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test("cannot accept ACDC from multisig exn if identifier is not locally stored", async () => {
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
        .mockImplementationOnce(() =>
          Promise.resolve({
            exn: {
              d: "ECWyfhUctyCCoxZG-PU7MFPWkw5H2--TMC9v_tbZjjBv",
              i: "ECa8C3YyqT9khmn0MnLUJKQTCNmiB6tr74uNUX_Y-r2y",
              p: "",
              dt: "2024-07-31T02:45:28.535000+00:00",
              r: "/multisig/exn",
              a: {
                gid: "EJgTVgwvxuY2pGAcuAcE_-77SA0wGRsvWGlaH8z_YP2f",
              },
              e: {
                exn: {
                  d: "EPcCdp9JRd5wgCVs7hmzB0JsbuqHhYU3ggShqR2QDpbH",
                  i: "EJgTVgwvxuY2pGAcuAcE_-77SA0wGRsvWGlaH8z_YP2f",
                  p: "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw",
                  dt: "2024-07-31T02:45:25.998000+00:00",
                  r: "/ipex/admit",
                  a: {
                    m: "",
                  },
                  e: {},
                },
                d: "EFHb7hpsDWdBdZyMVhQR6kJN6j9DddAAS-_pQQhq-yZ6",
              },
            },
          })
        )
        .mockImplementationOnce(() =>
          Promise.resolve({
            exn: {
              v: "KERI10JSON000514_",
              t: "exn",
              d: "EDm8iNyZ9I3P93jb0lFtL6DJD-4Mtd2zw1ADFOoEQAqw",
              i: "EKhebhdg6jOqK7ZgY-cFpx6rozpUave8llE2B15ioNHi",
              p: "",
              dt: "2024-07-31T02:45:17.288000+00:00",
              r: "/ipex/grant",
              q: {},
              a: {
                m: "",
                i: "EJgTVgwvxuY2pGAcuAcE_-77SA0wGRsvWGlaH8z_YP2f",
              },
              e: {
                acdc: {
                  v: "ACDC10JSON00018d_",
                  d: "EJvvnAZruVSfvPZjzGwyTR3RQApoK7228du0c8flDcaF",
                  i: "EKhebhdg6jOqK7ZgY-cFpx6rozpUave8llE2B15ioNHi",
                  ri: "EDXcY9Jsg32LgZ8S5QuHNi3ZF5U01_kU3FakVUMCbGG3",
                  s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
                  a: {
                    d: "EKoEogKtVuRAkoFs43CLPTwSAUuo3TQsmnKI86ef2Usb",
                    i: "EJgTVgwvxuY2pGAcuAcE_-77SA0wGRsvWGlaH8z_YP2f",
                    dt: "2024-07-31T02:45:16.860000+00:00",
                    LEI: "New 310724",
                  },
                },
                d: "EK3-ZPPv8JYVAIK8pq1SfQxvHlsKmwdpqxqO1kcP_ajv",
              },
            },
          })
        ),
    });

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);

    await expect(
      ipexCommunicationService.acceptAcdcFromMultisigExn(id)
    ).rejects.toThrowError(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    expect(
      Agent.agent.keriaNotifications.deleteNotificationRecordById
    ).not.toBeCalledWith(id);
  });
});
