import { EventService } from "./eventService";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { Agent } from "../agent";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";

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
      signifyNotifications: {
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
        addPendingOperationToQueue: jest.fn(),
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
  operationPendingStorage as any
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

describe("Ipex communication service of agent", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });
  test("can accept ACDC", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "uuid";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    schemaGetMock.mockResolvedValue({ title: "title" });
    credentialListMock.mockResolvedValue([
      {
        sad: {
          d: "id",
        },
      },
    ]);
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue({
      id: "id",
    });

    await ipexCommunicationService.acceptAcdc(id);
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        connectionId: "i",
      })
    );
    expect(operationPendingStorage.save).toBeCalledWith({
      id: "opName",
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    expect(
      Agent.agent.signifyNotifications.addPendingOperationToQueue
    ).toBeCalledTimes(1);
    expect(deleteNotificationMock).toBeCalledWith(id);
  });

  test("cannot accept ACDC if the notification is missing in the DB", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const id = "not-found-id";
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
      ipexCommunicationService.markAcdcComplete(id)
    ).rejects.toThrowError(
      IpexCommunicationService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
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
      apply: "d",
    });
    expect(deleteNotificationMock).toBeCalledWith(id);
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
    getExchangeMock = jest.fn().mockResolvedValue({
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
    schemaGetMock.mockResolvedValue({
      title: "Qualified vLEI Issuer Credential",
      description: "Qualified vLEI Issuer Credential",
    });
    credentialStorage.getCredentialMetadatasById.mockResolvedValue([
      {
        id: "metadata:d",
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

    schemaGetMock.mockRejectedValueOnce(
      new Error("request - 404 - SignifyClient message")
    );
    resolveOobiMock.mockResolvedValueOnce({ done: false });
    await ipexCommunicationService.createLinkedIpexMessageRecord(
      grantIpexMessageMock,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );
    expect(ipexMessageRecordStorage.createIpexMessageRecord).toBeCalledWith({
      id: grantIpexMessageMock.exn.d,
      credentialType: undefined,
      content: grantIpexMessageMock,
      connectionId: grantIpexMessageMock.exn.i,
      historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
    });

    schemaGetMock.mockRejectedValueOnce(
      new Error("request - 404 - SignifyClient message")
    );
    resolveOobiMock.mockResolvedValueOnce({ done: true });
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
    expect(schemaGetMock).toBeCalledTimes(5);
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
});
