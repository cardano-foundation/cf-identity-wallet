import { Agent, AutoAcceptCredential } from "@aries-framework/core";
import { CredentialMetadataRecord } from "../modules";
import { CredentialService } from "./credentialService";
import { CredentialMetadataRecordStatus } from "../modules/generalStorage/repositories/credentialMetadataRecord.types";

const agent = jest.mocked({
  credentials: {
    acceptOffer: jest.fn(),
    proposeCredential: jest.fn(),
    deleteById: jest.fn(),
  },
  events: {
    on: jest.fn(),
  },
  modules: {
    generalStorage: {
      getAllCredentialMetadata: jest.fn(),
      updateCredentialMetadata: jest.fn(),
      deleteCredentialMetadata: jest.fn(),
      getCredentialMetadata: jest.fn(),
    },
  },
});
const credentialService = new CredentialService(agent as any as Agent);

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];

const id1 = "id1";
const id2 = "id2";
const credentialMetadataProps = {
  id: id1,
  nameOnCredential: "Your name here",
  colors,
  createdAt: now,
  issuanceDate: nowISO,
  issuerLogo: "issuerLogoHere",
  credentialType: "credType",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: "1",
};
const credentialMetadataRecordA = new CredentialMetadataRecord(
  credentialMetadataProps
);
const credentialMetadataRecordB = new CredentialMetadataRecord({
  ...credentialMetadataProps,
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

  test("can accept a credential", async () => {
    const credentialRecordId = "connection1";
    await credentialService.acceptCredentialOffer(credentialRecordId);
    expect(agent.credentials.acceptOffer).toBeCalledWith({
      credentialRecordId,
    });
  });

  test("can propose a credential", async () => {
    const credentialRecordId = "connection1";
    await credentialService.proposeCredential(credentialRecordId, {});
    expect(agent.credentials.proposeCredential).toBeCalledWith({
      protocolVersion: "v2",
      connectionId: credentialRecordId,
      credentialFormats: {},
      autoAcceptCredential: AutoAcceptCredential.Always,
    });
  });

  test("can get all credentials", async () => {
    agent.modules.generalStorage.getAllCredentialMetadata = jest
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
        issuerLogo: credentialMetadataProps.issuerLogo,
        nameOnCredential: credentialMetadataRecordA.nameOnCredential,
      },
      {
        id: id2,
        colors,
        credentialType: credentialMetadataRecordB.credentialType,
        issuanceDate: nowISO,
        issuerLogo: credentialMetadataRecordB.issuerLogo,
        nameOnCredential: credentialMetadataRecordB.nameOnCredential,
      },
    ]);
  });

  test("can get all credentials if there are none", async () => {
    agent.modules.generalStorage.getAllCredentialMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await credentialService.getCredentials()).toStrictEqual([]);
  });

  test("can archive any credential (re-archiving does nothing)", async () => {
    const credId = "credId1";
    await credentialService.archiveCredential(credId);
    expect(
      agent.modules.generalStorage.updateCredentialMetadata
    ).toBeCalledWith(credId, { isArchived: true });
  });

  test("can delete an archived credential (cred and metadata record)", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    const credId = "credId1";
    await credentialService.deleteCredential(credId);
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(agent.credentials.deleteById).toBeCalledWith(credId);
    expect(
      agent.modules.generalStorage.deleteCredentialMetadata
    ).toBeCalledWith(credId);
  });

  test("cannot delete a non-archived credential", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    const credId = "credId1";
    await expect(
      credentialService.deleteCredential(credId)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_ARCHIVED);
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(agent.credentials.deleteById).not.toBeCalled();
    expect(
      agent.modules.generalStorage.deleteCredentialMetadata
    ).not.toBeCalled();
  });

  test("cannot delete a credential without a metadata record", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(null);
    const credId = "credId1";
    await expect(
      credentialService.deleteCredential(credId)
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(agent.credentials.deleteById).not.toBeCalled();
    expect(
      agent.modules.generalStorage.deleteCredentialMetadata
    ).not.toBeCalled();
  });

  test("can restore an archived credential", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    const credId = "credId1";
    await credentialService.restoreCredential(credId);
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(
      agent.modules.generalStorage.updateCredentialMetadata
    ).toBeCalledWith(credId, { isArchived: false });
  });

  test("cannot restore a non-archived credential", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    const credId = "credId1";
    await expect(
      credentialService.restoreCredential(credId)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_ARCHIVED);
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(
      agent.modules.generalStorage.updateCredentialMetadata
    ).not.toBeCalled();
  });

  test("cannot restore a credential without a metadata record", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(null);
    const credId = "credId1";
    await expect(
      credentialService.restoreCredential(credId)
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(
      agent.modules.generalStorage.updateCredentialMetadata
    ).not.toBeCalled();
  });
});
