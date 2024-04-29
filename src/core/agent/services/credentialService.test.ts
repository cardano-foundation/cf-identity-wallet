import { CredentialService } from "./credentialService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
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

const identifiersListMock = jest.fn();
const identifiersGetMock = jest.fn();
const identifiersCreateMock = jest.fn();
const identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const oobiResolveMock = jest.fn();
const groupGetRequestMock = jest.fn();
const queryKeyStateMock = jest.fn();
let credentialListMock = jest.fn();

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
    query: queryKeyStateMock,
    get: jest.fn(),
  }),

  groups: () => ({ getRequest: groupGetRequestMock }),
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

const agentServicesProps = {
  basicStorage: basicStorage as any,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
};

const credentialService = new CredentialService(agentServicesProps);

const now = new Date();
const nowISO = now.toISOString();

const id1 = "id1";
const id2 = "id2";
const credentialRecordId1 = "cId1";
const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
  createdAt: now,
  issuanceDate: nowISO,
  issuerLogo: "issuerLogoHere",
  credentialType: "credType",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: credentialRecordId1,
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
        credentialType: credentialMetadataRecordA.credentialType,
        issuanceDate: nowISO,
        status: CredentialMetadataRecordStatus.CONFIRMED,
      },
      {
        id: id2,
        credentialType: credentialMetadataRecordB.credentialType,
        issuanceDate: nowISO,
        status: CredentialMetadataRecordStatus.CONFIRMED,
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
      .mockResolvedValue(archivedMetadataRecord);
    const credId = "credId1";
    await credentialService.deleteCredential(credId);
    expect(credentialStorage.getCredentialMetadata).toBeCalledWith(credId);
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith(credId, {
      isDeleted: true,
    });
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
    expect(credentialStorage.updateCredentialMetadata).not.toBeCalled();
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

  test("create metadata record successfully", async () => {
    await credentialService.createMetadata(credentialMetadataProps);
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalled();
  });

  test("get acdc credential details successfully record by id", async () => {
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);

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
    credentialListMock = jest.fn().mockResolvedValue([acdc]);

    await expect(
      credentialService.getCredentialDetailsById(credentialMetadataRecordA.id)
    ).resolves.toStrictEqual({
      id: credentialMetadataRecordA.id,
      credentialType: credentialMetadataRecordA.credentialType,
      issuanceDate: nowISO,
      status: CredentialMetadataRecordStatus.CONFIRMED,
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

  test("can get credential short details by ID", async () => {
    const id = "testid";
    const credentialType = "TYPE-001";
    credentialStorage.getCredentialMetadata = jest.fn().mockReturnValue({
      id,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      credentialType,
      issuanceDate: nowISO,
      isDeleted: false,
      connectionId: undefined,
    });
    expect(
      await credentialService.getCredentialShortDetailsById(id)
    ).toStrictEqual({
      id,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      credentialType,
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

  test("Should call saveCredentialMetadataRecord when there are un-synced KERI credentials", async () => {
    credentialListMock.mockReturnValue([
      {
        sad: {
          v: "ACDC10JSON000197_",
          d: "EIuZp_JvO5pbNmS8jyG96t3d4XENaFSJpLtbLySxvz-X",
          i: "ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W",
          ri: "EA67QQC6C6OG4Pok44UHKegNS0YoQm3yxeZwJEbbdCrh",
          s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
          a: {
            d: "EDqWl2zEU2LtoVmP1s2jpWx9oFs3bs0zHxH6kdnIgx3-",
            i: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
            dt: "2023-11-29T02:13:34.858000+00:00",
            LEI: "5493001KJTIIGC8Y1R17",
          },
        },
      },
      {
        sad: {
          v: "ACDC10JSON000197_",
          d: "EL24R3ECGtv_UzQmYUcu9AeP1ks2JPzTxgPcQPkadEPY",
          i: "ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W",
          ri: "EA67QQC6C6OG4Pok44UHKegNS0YoQm3yxeZwJEbbdCrh",
          s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
          a: {
            d: "EC67QqakhZ1bZgKci_HsGMIKQybEdc9mJqykBecOG4rJ",
            i: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
            dt: "2023-11-29T02:12:35.716000+00:00",
            LEI: "5493001KJTIIGC8Y1R17",
          },
        },
      },
    ]);
    credentialStorage.getAllCredentialMetadata = jest.fn().mockReturnValue([]);
    await credentialService.syncACDCs();
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledTimes(2);
  });

  test("Must throw 'Credential with given SAID not found on KERIA' when there's no KERI credential", async () => {
    const id = "not-found-id";
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    credentialListMock = jest.fn().mockResolvedValue([]);
    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_FOUND);
  });
});
