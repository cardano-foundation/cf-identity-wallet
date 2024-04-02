import { CredentialService } from "./credentialService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { ConnectionType } from "../agent.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { EventService } from "./eventService";

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
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: credentialListMock,
  }),
  exchanges: () => ({
    get: jest.fn(),
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

const agentServicesProps = {
  basicStorage: basicStorage,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
};

const credentialService = new CredentialService(agentServicesProps);

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
  connectionType: ConnectionType.KERI,
};

const credentialMetadataRecordA = new CredentialMetadataRecord(
  credentialMetadataProps
);
const credentialMetadataRecordB = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  id: id2,
});

const archivedMetadataRecord = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  isArchived: true,
});

// Callbacks need to be tested at an integration/e2e test level
describe("Credential service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test("can get all credentials", async () => {
    credentialStorage.getAllCredentialMetadata = jest
      .fn()
      .mockResolvedValue([
        credentialMetadataRecordA,
        credentialMetadataRecordB,
      ]);

    expect(await credentialService.getCredentials()).toStrictEqual([
      {
        id: id1,
        colors,
        credentialType: credentialMetadataRecordA.credentialType,
        issuanceDate: nowISO,
        status: CredentialMetadataRecordStatus.CONFIRMED,
        connectionType: ConnectionType.KERI,
      },
      {
        id: id2,
        colors,
        credentialType: credentialMetadataRecordB.credentialType,
        issuanceDate: nowISO,
        status: CredentialMetadataRecordStatus.CONFIRMED,
        connectionType: ConnectionType.KERI,
      },
    ]);
  });

  test("can get all credentials if there are none", async () => {
    credentialStorage.getAllCredentialMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await credentialService.getCredentials()).toStrictEqual([]);
  });

  test("can archive any credential (re-archiving does nothing)", async () => {
    const credId = "credId1";
    await credentialService.archiveCredential(credId);
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith(credId, {
      isArchived: true,
    });
  });

  test("can delete an archived credential (cred and metadata record)", async () => {
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue({ ...credentialMetadataRecordA, isArchived: true });
    const credId = "credId1";
    await credentialService.deleteCredential(credId);
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
  });

  test("cannot delete a non-archived credential", async () => {
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    const credId = "credId1";
    await expect(
      credentialService.deleteCredential(credId)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_ARCHIVED);
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
    expect(credentialStorage.deleteCredentialMetadata).not.toBeCalled();
  });

  test("cannot delete a credential without a metadata record", async () => {
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue(null);
    const credId = "credId1";
    await expect(
      credentialService.deleteCredential(credId)
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
    expect(credentialStorage.deleteCredentialMetadata).not.toBeCalled();
  });

  test("can restore an archived credential", async () => {
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    const credId = "credId1";
    await credentialService.restoreCredential(credId);
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith(credId, {
      isArchived: false,
    });
  });

  test("cannot restore a non-archived credential", async () => {
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    const credId = "credId1";
    await expect(
      credentialService.restoreCredential(credId)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_ARCHIVED);
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
  });

  test("cannot restore a credential without a metadata record", async () => {
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue(null);
    const credId = "credId1";
    await expect(
      credentialService.restoreCredential(credId)
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
  });

  test("get acdc credential details successfully record by id", async () => {
    const acdcMetadataRecord = {
      ...credentialMetadataRecordA,
      connectionType: ConnectionType.KERI,
    };
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(acdcMetadataRecord);

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
        dt: nowISO,
      },
    };
    credentialListMock.mockResolvedValue([acdc]);

    await expect(
      credentialService.getCredentialDetailsById(acdcMetadataRecord.id)
    ).resolves.toStrictEqual({
      id: credentialMetadataRecordA.id,
      colors: credentialMetadataRecordA.colors,
      credentialType: acdcMetadataRecord.credentialType,
      issuanceDate: nowISO,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      connectionType: ConnectionType.KERI,
      i: acdc.sad.i,
      a: acdc.sad.a,
      s: {
        title: acdc.schema.title,
        description: acdc.schema.description,
        version: acdc.schema.version,
      },
      lastStatus: {
        s: acdc.status.s,
        dt: nowISO,
      },
    });
  });

  test("Must throw 'Credential with given SAID not found on KERIA' when there's no KERI credential", async () => {
    const id = "not-found-id";
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue({ ...credentialMetadataRecordA, isArchived: true });
    credentialListMock.mockResolvedValue([]);

    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_FOUND);
  });

  test("Must throw an error when there's error from Signigy-ts ", async () => {
    const id = "not-found-id";
    credentialListMock.mockRejectedValue("Network Error");
    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError();
  });

  test("can get credential short details by ID", async () => {
    const id = "testid";
    const credentialType = "TYPE-001";
    credentialStorage.getCredentialMetadata = jest.fn().mockReturnValue({
      id,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      colors,
      credentialType,
      connectionType: ConnectionType.KERI,
      issuanceDate: nowISO,
      isDeleted: false,
      connectionId: undefined,
    });
    expect(
      await credentialService.getCredentialShortDetailsById(id)
    ).toStrictEqual({
      id,
      colors,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      credentialType,
      connectionType: ConnectionType.KERI,
      issuanceDate: nowISO,
    });
  });

  test("cannot get credential short details by ID if the credential does not exist", async () => {
    credentialStorage.getCredentialMetadata = jest.fn().mockResolvedValue(null);
    await expect(
      credentialService.getCredentialShortDetailsById("randomid")
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
  });
});
