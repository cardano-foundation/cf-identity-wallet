import { EventService } from "./eventService";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { CredentialStatus } from "./credentialService.types";

const basicStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn().mockImplementation((id: string) => {
    if (id === "uuid") {
      return {
        id,
        createdAt: "2024-04-29T11:01:04.903Z",
        content: {
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
});

const credentialListMock = jest.fn();
const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: jest.fn(),
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
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: credentialListMock,
  }),
  exchanges: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      if (id == "saidForUuid") {
        return {
          exn: {
            a: {
              i: "uuid",
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
    }),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
});

const eventService = new EventService();

const agentServicesProps = {
  basicStorage: basicStorage as any,
  signifyClient: signifyClient as any,
  eventService,
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
  peerConnectionStorage: {} as any,
};

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        resolveOobi: jest.fn(),
      },
    },
  },
}));

const ipexCommunicationService = new IpexCommunicationService(
  agentServicesProps
);

describe("Ipex communication service of agent", () => {
  test("can accept ACDC", async () => {
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
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue({
      id: "id",
    });
    await ipexCommunicationService.acceptAcdc(id);
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalled();
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith("id", {
      id: "id",
      status: CredentialStatus.CONFIRMED,
    });
    expect(basicStorage.deleteById).toBeCalledWith(id);
  });

  test("cannot accept ACDC if the notification is missing in the DB", async () => {
    const id = "not-found-id";
    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  // This logic must change if we are accepting presentations later.
  test("cannot accept ACDC if identifier is not locally stored", async () => {
    // @TODO - foconnor: Ensure syncing process resovles this edge case of identifier in cloud but not local prior to release.
    const id = "uuid";
    basicStorage.findById = jest.fn().mockResolvedValue({
      id,
      createdAt: "2024-04-29T11:01:04.903Z",
      content: {
        d: "saidForUuid",
      },
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY
    );
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalled();
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
    expect(basicStorage.deleteById).not.toBeCalled();
  });

  // This test should go when this has been made event driven.
  test("throws if a credential does not appear in KERIA after admitting", async () => {
    const id = "uuid";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      signifyName: "holder",
    });
    credentialListMock.mockImplementation(() => {
      throw new Error("404 on KERIA");
    });
    // Could use fake timers instead.
    await expect(
      ipexCommunicationService.acceptAcdc(id, {
        maxAttempts: 2,
        interval: 10,
      })
    ).rejects.toThrowError(IpexCommunicationService.ACDC_NOT_APPEARING);
  });

  test("cannot mark credential as confirmed if metadata is missing", async () => {
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
    await expect(ipexCommunicationService.acceptAcdc(id)).rejects.toThrowError(
      IpexCommunicationService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
  });
});
