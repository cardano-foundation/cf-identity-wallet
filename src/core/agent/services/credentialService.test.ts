import { CredentialService } from "./credentialService";
import { CredentialMetadataRecordProps } from "../records/credentialMetadataRecord.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { CoreEventEmitter } from "../event";
import { Agent } from "../agent";
import { CredentialStatus } from "./credentialService.types";
import { IdentifierType } from "./identifier.types";
import { memberIdentifierRecord } from "../../__fixtures__/agent/multSigFixtures";

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
let getCredentialMock = jest.fn();

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
    get: getCredentialMock,
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
  getCredentialMetadataByConnectionId: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
});

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
    },
  },
}));

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter: new CoreEventEmitter(),
};

const notificationStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const credentialService = new CredentialService(
  agentServicesProps,
  credentialStorage as any,
  notificationStorage as any,
  identifierStorage as any
);

const now = new Date();
const nowISO = now.toISOString();

const id1 = "id1";
const id2 = "id2";
const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
  createdAt: now,
  issuanceDate: nowISO,
  credentialType: "credType",
  status: CredentialStatus.CONFIRMED,
  connectionId: "EEnw0sGaicPN-9gHgU62JIZOYo7cMzXjd-fpwJ1EgdK6",
  schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  identifierType: IdentifierType.Individual,
  identifierId: memberIdentifierRecord.id,
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
        status: CredentialStatus.CONFIRMED,
        schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
        identifierType: IdentifierType.Individual,
        identifierId: memberIdentifierRecord.id,
      },
      {
        id: id2,
        credentialType: credentialMetadataRecordB.credentialType,
        issuanceDate: nowISO,
        status: CredentialStatus.CONFIRMED,
        schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
        identifierType: IdentifierType.Individual,
        identifierId: memberIdentifierRecord.id,
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
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
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
    getCredentialMock = jest.fn().mockResolvedValue(acdc);

    await expect(
      credentialService.getCredentialDetailsById(credentialMetadataRecordA.id)
    ).resolves.toStrictEqual({
      id: credentialMetadataRecordA.id,
      status: CredentialStatus.CONFIRMED,
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
      schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
      identifierType: IdentifierType.Individual,
      identifierId: memberIdentifierRecord.id,
    });
  });

  test("can get credential short details by ID", async () => {
    const id = "testid";
    const credentialType = "TYPE-001";
    credentialStorage.getCredentialMetadata = jest.fn().mockReturnValue({
      id,
      status: CredentialStatus.CONFIRMED,
      credentialType,
      issuanceDate: nowISO,
      isDeleted: false,
      connectionId: undefined,
      schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
      identifierType: IdentifierType.Individual,
      identifierId: memberIdentifierRecord.id,
    });
    expect(
      await credentialService.getCredentialShortDetailsById(id)
    ).toStrictEqual({
      id,
      status: CredentialStatus.CONFIRMED,
      credentialType,
      issuanceDate: nowISO,
      schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
      identifierType: IdentifierType.Individual,
      identifierId: memberIdentifierRecord.id,
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

  test("Should throw an error when KERIA is offline ", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    await expect(
      credentialService.getCredentialDetailsById("not-found-id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(credentialService.syncACDCs()).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
  });
  test("Should call saveCredentialMetadataRecord when there are un-synced KERI credentials", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
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
        schema: {
          $id: "id-1",
          tile: "title1",
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
        schema: {
          $id: "id-2",
          tile: "title2",
        },
      },
    ]);
    credentialStorage.getAllCredentialMetadata = jest.fn().mockReturnValue([]);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...memberIdentifierRecord,
      id: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
    });
    await credentialService.syncACDCs();
    expect(credentialStorage.saveCredentialMetadataRecord).toBeCalledTimes(2);
  });

  test("Must throw 'Credential with given SAID not found on KERIA' when there's no KERI credential", async () => {
    const id = "not-found-id";
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    credentialStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    credentialListMock = jest.fn().mockResolvedValue([]);
    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_FOUND);
  });

  test("Can delete stale local credential", async () => {
    const credentialId = "credential-id";
    await credentialService.deleteStaleLocalCredential(credentialId);
    expect(credentialStorage.deleteCredentialMetadata).toBeCalledWith(
      credentialId
    );
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
      credentialService.markAcdc(id, CredentialStatus.CONFIRMED)
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
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
    await credentialService.markAcdc(id, CredentialStatus.CONFIRMED);
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
    await credentialService.markAcdc(id, CredentialStatus.REVOKED);
    expect(credentialStorage.updateCredentialMetadata).toBeCalledWith(
      pendingCredentialMock.id,
      {
        ...pendingCredentialMock,
        status: CredentialStatus.REVOKED,
      }
    );
  });
});
