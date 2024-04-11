import { CredentialService } from "./credentialService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { AcdcKeriEventTypes, AcdcKeriStateChangedEvent } from "../agent.types";
import { EventService } from "./eventService";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { CredentialStatus } from "./credentialService.types";

const basicStorage = jest.mocked({
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
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  getCredentialMetadataByCredentialRecordId: jest.fn(),
  getCredentialMetadataByConnectionId: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
});

const credentialListMock = jest.fn();
const exchangeGetMock = jest.fn();

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
    get: exchangeGetMock,
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
  basicStorage: basicStorage,
  signifyClient: signifyClient as any,
  eventService,
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
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

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];

const id1 = "id1";
const id2 = "id2";
const credentialRecordId1 = "cId1";
const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
  colors,
  createdAt: now,
  issuanceDate: nowISO,
  issuerLogo: "issuerLogoHere",
  credentialType: "credType",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: credentialRecordId1,
};

describe("Ipex communication service of agent", () => {
  test("callback will run when have a event listener of ACDC KERI state changed", async () => {
    const callback = jest.fn();
    ipexCommunicationService.onAcdcKeriStateChanged(callback);
    const event: AcdcKeriStateChangedEvent = {
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        credential: {
          id: "acdc",
          colors: ["#fff", "#fff"],
          issuanceDate: "dt",
          credentialType: "type",
          status: CredentialMetadataRecordStatus.CONFIRMED,
        },
        status: CredentialStatus.CONFIRMED,
      },
    };
    eventService.emit(event);
    expect(callback).toBeCalledWith(event);
  });

  test("accept KERI ACDC", async () => {
    const id = "uuid";
    const date = new Date();
    basicStorage.findById = jest.fn().mockImplementation((id) => {
      if (id == "uuid") {
        return {
          id,
          createdAt: date,
          content: {
            d: "keri",
          },
        };
      }
      return;
    });
    exchangeGetMock.mockResolvedValue({
      exn: {
        a: {
          i: "uuid",
        },
        i: "i",
        e: {
          acdc: {
            d: "id",
            a: {
              dt: nowISO,
            },
          },
        },
      },
    });
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
    credentialStorage.getCredentialMetadataByCredentialRecordId = jest
      .fn()
      .mockResolvedValue({
        id: "id",
      });
    await ipexCommunicationService.acceptKeriAcdc(id);
    expect(basicStorage.deleteById).toBeCalled();
  });

  test("Must throw an error when there's no KERI notification", async () => {
    const id = "not-found-id";
    basicStorage.findById = jest.fn();
    await expect(
      ipexCommunicationService.acceptKeriAcdc(id)
    ).rejects.toThrowError(
      `${CredentialService.KERI_NOTIFICATION_NOT_FOUND} ${id}`
    );
  });
});
