import {
  Agent,
  Attachment,
  AutoAcceptCredential,
  CredentialEventTypes,
  CredentialExchangeRecord,
  CredentialState,
  CredentialStateChangedEvent,
  JsonObject,
  V2OfferCredentialMessage,
  W3cCredentialRecord,
  W3cJsonLdVerifiableCredential,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { CredentialMetadataRecord } from "../modules";
import { CredentialService } from "./credentialService";
import { CredentialMetadataRecordStatus } from "../modules/generalStorage/repositories/credentialMetadataRecord.types";

const eventEmitter = new EventEmitter();

const agent = jest.mocked({
  credentials: {
    acceptOffer: jest.fn(),
    proposeCredential: jest.fn(),
    deleteById: jest.fn(),
    getById: jest.fn(),
    findOfferMessage: jest.fn(),
    negotiateOffer: jest.fn(),
  },
  connections: {
    findById: jest.fn(),
  },
  events: {
    on: eventEmitter.on.bind(eventEmitter),
  },
  eventEmitter: {
    emit: eventEmitter.emit.bind(eventEmitter),
  },
  modules: {
    generalStorage: {
      getAllCredentialMetadata: jest.fn(),
      updateCredentialMetadata: jest.fn(),
      deleteCredentialMetadata: jest.fn(),
      getCredentialMetadata: jest.fn(),
      saveCredentialMetadataRecord: jest.fn(),
      getCredentialMetadataByCredentialRecordId: jest.fn(),
    },
  },
  w3cCredentials: {
    getCredentialRecordById: jest.fn(),
  },
  dids: {
    getCreatedDids: jest.fn(),
  },
});
const credentialService = new CredentialService(agent as any as Agent);

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];

const id1 = "id1";
const id2 = "id2";
const credentialRecordId1 = "cId1";
const credentialMetadataProps = {
  id: id1,
  colors,
  createdAt: now,
  issuanceDate: nowISO,
  issuerLogo: "issuerLogoHere",
  credentialType: "credType",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: credentialRecordId1,
};
const credentialExchangeProps = {
  id: credentialRecordId1,
  connectionId: "1",
  threadId: "1",
  protocolVersion: "v2",
  credentials: [
    {
      credentialRecordId: credentialRecordId1,
      credentialRecordType: "CredentialRecord",
    },
  ],
};

const credentialDoneExchangeRecord = new CredentialExchangeRecord({
  ...credentialExchangeProps,
  state: CredentialState.Done,
});

const credentialOfferReceivedRecordAutoAccept = new CredentialExchangeRecord({
  ...credentialExchangeProps,
  state: CredentialState.OfferReceived,
  autoAcceptCredential: undefined,
});

const credentialOfferReceivedRecordNoAutoAccept = new CredentialExchangeRecord({
  ...credentialExchangeProps,
  state: CredentialState.OfferReceived,
  autoAcceptCredential: AutoAcceptCredential.Always,
});

const credentialRequestSentRecordAutoAccept = new CredentialExchangeRecord({
  ...credentialExchangeProps,
  state: CredentialState.RequestSent,
  autoAcceptCredential: undefined,
});

const w3cCredentialRecord = new W3cCredentialRecord({
  tags: {
    expandedTypes: [
      "https://www.w3.org/2018/credentials#VerifiableCredential",
      "https://example.org/examples#UniversityDegreeCredential",
    ],
    issuerId: "did:key:z6MkgbKgxfW1zgGVwRRmGLrwmFiNT6MZjPvG7xQ8LhAJonbx",
    subjectIds: [],
    schemaIds: [],
    contexts: [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
    ],
    proofTypes: ["Ed25519Signature2018"],
  },
  id: "5c030818-0a6c-416f-a5f4-7076b2de42a9",
  credential: {
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
    ],
    issuer: "did:key:z6MkgbKgxfW1zgGVwRRmGLrwmFiNT6MZjPvG7xQ8LhAJonbx",
    issuanceDate: nowISO,
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      degree: {
        type: "Bachelor Degree",
        name: "Bachelor of Science and Arts",
      },
    } as any,
    expirationDate: "2100-10-22T12:23:48Z",
    proof: {
      verificationMethod:
        "did:key:z6MkgbKgxfW1zgGVwRRmGLrwmFiNT6MZjPvG7xQ8LhAJonbx#z6MkgbKgxfW1zgGVwRRmGLrwmFiNT6MZjPvG7xQ8LhAJonbx",
      type: "Ed25519Signature2018",
      proofPurpose: "assertionMethod",
      jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw",
    },
  } as any as W3cCredentialRecord["credential"],
});

const w3cCredentialRecordArrayProof = {
  ...w3cCredentialRecord,
  credential: {
    ...w3cCredentialRecord.credential,
    proof: [
      {
        ...(w3cCredentialRecord.credential as W3cJsonLdVerifiableCredential)
          .proof,
      },
      {
        ...(w3cCredentialRecord.credential as W3cJsonLdVerifiableCredential)
          .proof,
      },
    ],
  },
};

const offerAttachment = new Attachment({
  id: "attachId",
  mimeType: "application/json",
  data: { base64: "eyJkYXRhIjogIm1lc3NhZ2UifQ==" },
});

const v2OfferCredentialMessage = new V2OfferCredentialMessage({
  credentialPreview: {} as any,
  offerAttachments: [offerAttachment],
  formats: [
    {
      attachmentId: "c2b9f232-16c8-44d0-a757-ea15d712af01",
      format: "aries/ld-proof-vc-detail@v1.0",
    },
  ],
});

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
        status: CredentialMetadataRecordStatus.CONFIRMED,
      },
      {
        id: id2,
        colors,
        credentialType: credentialMetadataRecordB.credentialType,
        issuanceDate: nowISO,
        issuerLogo: credentialMetadataRecordB.issuerLogo,
        status: CredentialMetadataRecordStatus.CONFIRMED,
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

  test("get credential successfully record by id", () => {
    credentialService.getCredentialRecordById(credentialDoneExchangeRecord.id);
    expect(agent.credentials.getById).toBeCalledWith(
      credentialDoneExchangeRecord.id
    );
  });

  test("get credential details successfully record by id", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    agent.credentials.getById = jest
      .fn()
      .mockResolvedValue(credentialDoneExchangeRecord);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cCredentialRecord);

    await expect(
      credentialService.getCredentialDetailsById(credentialMetadataRecordA.id)
    ).resolves.toStrictEqual({
      id: credentialMetadataRecordA.id,
      colors: credentialMetadataRecordA.colors,
      connectionId: credentialDoneExchangeRecord.connectionId,
      credentialSubject: w3cCredentialRecord.credential.credentialSubject,
      credentialType: "credType",
      expirationDate: "2100-10-22T12:23:48Z",
      issuanceDate: nowISO,
      issuerLogo: "issuerLogoHere",
      proofType: "Ed25519Signature2018",
      proofValue:
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw",
      status: CredentialMetadataRecordStatus.CONFIRMED,
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
    });
  });

  test("get credential details successfully record by id array proof", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(credentialMetadataRecordA);
    agent.credentials.getById = jest
      .fn()
      .mockResolvedValue(credentialDoneExchangeRecord);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cCredentialRecordArrayProof);

    await expect(
      credentialService.getCredentialDetailsById(credentialMetadataRecordA.id)
    ).resolves.toStrictEqual({
      id: credentialMetadataRecordA.id,
      colors: credentialMetadataRecordA.colors,
      connectionId: credentialDoneExchangeRecord.connectionId,
      credentialSubject: w3cCredentialRecord.credential.credentialSubject,
      credentialType: "credType",
      expirationDate: "2100-10-22T12:23:48Z",
      issuanceDate: nowISO,
      issuerLogo: "issuerLogoHere",
      proofType: "Ed25519Signature2018,Ed25519Signature2018",
      proofValue:
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw,eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw",
      status: CredentialMetadataRecordStatus.CONFIRMED,
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
    });
  });

  test("get preview credential successfully by credentialRecord", async () => {
    agent.credentials.findOfferMessage = jest
      .fn()
      .mockResolvedValue(v2OfferCredentialMessage);
    const data = await credentialService.getPreviewCredential(
      credentialDoneExchangeRecord
    );
    expect(data).toStrictEqual({
      data: "message",
    });
  });

  test("create metadata record successfully", async () => {
    await credentialService.createMetadata(credentialMetadataProps);
    expect(
      agent.modules.generalStorage.saveCredentialMetadataRecord
    ).toBeCalled();
  });

  test("update metadata completed without connection successfully when credential is done", async () => {
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue(credentialMetadataRecordA);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cCredentialRecord);
    const dataAfterUpdate = await credentialService.updateMetadataCompleted(
      credentialDoneExchangeRecord
    );
    expect(dataAfterUpdate).toStrictEqual({
      colors: credentialMetadataRecordA.colors,
      credentialType: w3cCredentialRecord.credential.type[1],
      id: id1,
      isArchived: false,
      issuanceDate: w3cCredentialRecord.credential.issuanceDate,
      issuerLogo: undefined,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      degreeType: Array.isArray(
        w3cCredentialRecord.credential.credentialSubject
      )
        ? undefined
        : (
            (w3cCredentialRecord.credential.credentialSubject as any)
              .degree as JsonObject
        ).type,
    });
  });

  test("update metadata completed with connection successfully when credential is done", async () => {
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue(credentialMetadataRecordA);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cCredentialRecord);
    agent.connections.findById = jest
      .fn()
      .mockResolvedValue({ imageUrl: "mockUrl" });
    const dataAfterUpdate = await credentialService.updateMetadataCompleted(
      credentialDoneExchangeRecord
    );
    expect(dataAfterUpdate.issuerLogo).toEqual("mockUrl");
  });

  test("negotiation credential must fail if did haven't found", async () => {
    const testDid = "did:key:test";
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([]);

    await expect(
      credentialService.negotiateOfferWithDid(
        testDid,
        credentialOfferReceivedRecordNoAutoAccept
      )
    ).rejects.toThrowError(CredentialService.CREATED_DID_NOT_FOUND);
  });

  test("negotiation credential must fail if credential preview haven't found", async () => {
    const testDid = "did:key:test";

    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([{ did: testDid }]);

    await expect(
      credentialService.negotiateOfferWithDid(
        testDid,
        credentialOfferReceivedRecordNoAutoAccept
      )
    ).rejects.toThrowError(CredentialService.CREDENTIAL_MISSING_FOR_NEGOTIATE);
  });

  test("negotiation credential with preview credential run successfully", async () => {
    const testDid = "did:key:test";
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([{ did: testDid }]);

    credentialService.getPreviewCredential = jest.fn().mockResolvedValue({
      options: {},
      credential: {},
    });

    await credentialService.negotiateOfferWithDid(
      testDid,
      credentialOfferReceivedRecordNoAutoAccept
    );

    expect(agent.credentials.negotiateOffer).toBeCalledWith({
      credentialRecordId: credentialOfferReceivedRecordNoAutoAccept.id,
      credentialFormats: {
        jsonld: {
          options: {},
          credential: {
            credentialSubject: {
              id: testDid,
            },
          },
        },
      },
    });
  });
});

describe("Credential service of agent - CredentialExchangeRecord helpers", () => {
  test("callback will run when have a event listener", async () => {
    const callback = jest.fn();
    credentialService.onCredentialStateChanged(callback);
    const event: CredentialStateChangedEvent = {
      type: CredentialEventTypes.CredentialStateChanged,
      payload: {
        credentialRecord: credentialDoneExchangeRecord,
        previousState: CredentialState.CredentialReceived,
      },
      metadata: {
        contextCorrelationId: id1,
      },
    };
    agent.eventEmitter.emit(CredentialEventTypes.CredentialStateChanged, event);
    expect(callback).toBeCalledWith(event);
  });

  test("credential record represents incoming offer", () => {
    expect(
      credentialService.isCredentialOfferReceived(
        credentialOfferReceivedRecordAutoAccept
      )
    ).toBe(true);
  });

  test("credential record represents incoming offer should be ignored if auto accept is always", () => {
    expect(
      credentialService.isCredentialOfferReceived(
        credentialOfferReceivedRecordNoAutoAccept
      )
    ).toBe(false);
  });

  test("credential record represents after accepted credential", () => {
    expect(
      credentialService.isCredentialRequestSent(
        credentialRequestSentRecordAutoAccept
      )
    ).toBe(true);
  });

  test("credential record represents done", () => {
    expect(
      credentialService.isCredentialDone(credentialDoneExchangeRecord)
    ).toBe(true);
  });
});
