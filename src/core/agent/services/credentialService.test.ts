import {
  Agent,
  Attachment,
  AutoAcceptCredential,
  CredentialEventTypes,
  CredentialExchangeRecord,
  CredentialState,
  CredentialStateChangedEvent,
  V2OfferCredentialMessage,
  W3cCredentialRecord,
  W3cJsonLdVerifiableCredential,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { CredentialMetadataRecord } from "../modules";
import { CredentialService } from "./credentialService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../modules/generalStorage/repositories/credentialMetadataRecord.types";
import { CredentialStatus } from "./credentialService.types";
import {
  AcdcKeriEventTypes,
  AcdcKeriStateChangedEvent,
  ConnectionType,
} from "../agent.types";

const eventEmitter = new EventEmitter();

const agent = jest.mocked({
  credentials: {
    acceptOffer: jest.fn(),
    proposeCredential: jest.fn(),
    deleteById: jest.fn(),
    getById: jest.fn(),
    findOfferMessage: jest.fn(),
    negotiateOffer: jest.fn(),
    findAllByQuery: jest.fn(),
  },
  connections: {
    findById: jest.fn(),
  },
  events: {
    on: eventEmitter.on.bind(eventEmitter),
    emit: jest.fn(),
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
      getIdentifierMetadata: jest.fn(),
    },
    signify: {
      admitIpex: jest.fn(),
      getNotifications: jest.fn(),
      markNotification: jest.fn(),
      getKeriExchange: jest.fn(),
      getCredentials: jest.fn(),
      getCredentialBySaid: jest.fn(),
      getCredentialsBySchema: jest.fn(),
      offerAcdc: jest.fn(),
      grantAcdc: jest.fn(),
      getIdentifierById: jest.fn(),
    },
  },
  w3cCredentials: {
    getCredentialRecordById: jest.fn(),
  },
  dids: {
    getCreatedDids: jest.fn(),
  },
  genericRecords: {
    save: jest.fn(),
    findAllByQuery: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
  },
});
const credentialService = new CredentialService(agent as any as Agent);

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
  connectionType: ConnectionType.DIDCOMM,
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

const w3cResidencyCredentialRecord = {
  ...w3cCredentialRecord,
  credential: {
    context: [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
      "https://w3id.org/citizenship/v1",
    ],
    id: "https://www.uscis.gov/green-card/credential/875970870",
    type: ["VerifiableCredential", "PermanentResidentCard"],
    issuer: "did:key:z6MktNjjqFdTksu46nngQ1xhisB1J426DcjLSA1rKwYHzM4A",
    identifier: "did:key:z6MktNjjqFdTksu46nngQ1xhisB1J426DcjLSA1rKwYHzM4H",
    name: "Permanent Resident Card",
    description: "United States of America",
    expirationDate: "2025-12-12T12:12:12Z",
    credentialSubject: {
      id: "did:key:z6MktNjjqFdTksu46nngQ1xhisB1J426DcjLSA1rKwYHzM4B",
      type: ["PermanentResident", "Person"],
      birthCountry: "The Bahamas",
      givenName: "John",
      familyName: "Smith",
      gender: "Male",
      image: "http://127.0.0.1:3001/static/ResIdImg.jpg",
      residentSince: "2022-10-10T10:12:12Z",
      lprCategory: "C09",
      lprNumber: "999-999-999",
    },
  } as any as W3cCredentialRecord["credential"],
};

const w3cSummitCredentialRecord = {
  ...w3cCredentialRecord,
  credential: {
    context: [
      "https://www.w3.org/2018/credentials/v1",
      "http://127.0.0.1:3001/credentials/schemas/summit/v1",
    ],
    type: ["VerifiableCredential", "AccessPassCredential"],
    credentialSubject: {
      id: "did:key:z6Mkvdhigk2EwyFy1ZYNvVrwRZYGujePLha9zLkB9JNGshRg",
      type: "AccessPass",
      eventName: "Cardano Summit 2023",
      passId: "4c44c251-eaa3-4c77-be07-d378b7b98497",
      name: "John Smith",
      startDate: "November 2, 2023",
      endDate: "November 2, 2023",
      location: "Dubai, UAE",
    },
  } as any as W3cCredentialRecord["credential"],
};

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

const universityCredMetadataProps: CredentialMetadataRecordProps = {
  ...credentialMetadataProps,
  credentialType: "UniversityDegreeCredential",
  cachedDetails: {
    degreeType: "Bachelor Degree",
  },
};
const residencyCredMetadataProps: CredentialMetadataRecordProps = {
  ...credentialMetadataProps,
  credentialType: "PermanentResidentCard",
  cachedDetails: {
    image: "http://127.0.0.1:3001/static/ResIdImg.jpg",
    givenName: "John",
    familyName: "Smith",
    birthCountry: "The Bahamas",
    lprCategory: "C09",
    residentSince: "2022-10-10T10:12:12Z",
    expirationDate: "2025-12-12T12:12:12Z",
  },
};
const summitCredMetadataProps: CredentialMetadataRecordProps = {
  ...credentialMetadataProps,
  credentialType: "AccessPassCredential",
  cachedDetails: {
    summitType: "AccessPass",
    startDate: "November 2, 2023",
    endDate: "November 2, 2023",
    passId: "4c44c251-eaa3-4c77-be07-d378b7b98497",
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
const genericRecords = [
  {
    id: "uuid",
    content: "mockContent",
    createdAt: new Date(),
  },
];
const keriNotifications = genericRecords.map((result) => {
  return {
    id: result.id,
    createdAt: result.createdAt,
    a: result.content as any,
  };
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
    agent.genericRecords.findAllByQuery = jest.fn().mockResolvedValue([]);

    expect(await credentialService.getCredentials()).toStrictEqual([
      {
        id: id1,
        colors,
        credentialType: credentialMetadataRecordA.credentialType,
        issuanceDate: nowISO,
        status: CredentialMetadataRecordStatus.CONFIRMED,
        cachedDetails: undefined,
        connectionType: ConnectionType.DIDCOMM,
      },
      {
        id: id2,
        colors,
        credentialType: credentialMetadataRecordB.credentialType,
        issuanceDate: nowISO,
        status: CredentialMetadataRecordStatus.CONFIRMED,
        cachedDetails: undefined,
        connectionType: ConnectionType.DIDCOMM,
      },
    ]);
  });

  test("can get all credentials if there are none", async () => {
    agent.modules.generalStorage.getAllCredentialMetadata = jest
      .fn()
      .mockResolvedValue([]);
    agent.genericRecords.findAllByQuery = jest.fn().mockResolvedValue([]);

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
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue({
        ...archivedMetadataRecord,
        connectionType: ConnectionType.KERI,
      });
    await credentialService.deleteCredential(credId);
    expect(agent.modules.generalStorage.getCredentialMetadata).toBeCalledWith(
      credId
    );
    expect(agent.modules.generalStorage.updateCredentialMetadata).toBeCalled();
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
      proofType: "Ed25519Signature2018",
      proofValue:
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw",
      status: CredentialMetadataRecordStatus.CONFIRMED,
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      cachedDetails: undefined,
      connectionType: ConnectionType.DIDCOMM,
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
      proofType: "Ed25519Signature2018,Ed25519Signature2018",
      proofValue:
        "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw,eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mtpv5xBXtbwpFokCVQtLFmdJ0nMm5EtGkiOUn0cRDtA-yfF3TrFBNMm8tCINygMla4YZB3ifb-NB0ZOrNQV8Cw",
      status: CredentialMetadataRecordStatus.CONFIRMED,
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      cachedDetails: undefined,
      connectionType: ConnectionType.DIDCOMM,
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

  test("update university credential metadata completed without connection successfully when credential is done", async () => {
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue(universityCredMetadataProps);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cCredentialRecord);
    const dataAfterUpdate = await credentialService.updateMetadataCompleted(
      credentialDoneExchangeRecord
    );
    expect(dataAfterUpdate).toStrictEqual({
      colors: universityCredMetadataProps.colors,
      credentialType: w3cCredentialRecord.credential.type[1],
      id: id1,
      isArchived: false,
      issuanceDate: w3cCredentialRecord.credential.issuanceDate,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      cachedDetails: universityCredMetadataProps.cachedDetails,
      connectionType: ConnectionType.DIDCOMM,
    });
  });

  test("update residency credential metadata completed without connection successfully when credential is done", async () => {
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue(residencyCredMetadataProps);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cResidencyCredentialRecord);
    const dataAfterUpdate = await credentialService.updateMetadataCompleted(
      credentialDoneExchangeRecord
    );
    expect(dataAfterUpdate).toStrictEqual({
      colors: residencyCredMetadataProps.colors,
      credentialType: residencyCredMetadataProps.credentialType,
      id: id1,
      isArchived: false,
      issuanceDate: w3cCredentialRecord.credential.issuanceDate,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      cachedDetails: residencyCredMetadataProps.cachedDetails,
      connectionType: ConnectionType.DIDCOMM,
    });
  });

  test("update summit credential metadata completed without connection successfully when credential is done", async () => {
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue(summitCredMetadataProps);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cSummitCredentialRecord);
    const dataAfterUpdate = await credentialService.updateMetadataCompleted(
      credentialDoneExchangeRecord
    );
    expect(dataAfterUpdate).toStrictEqual({
      colors: summitCredMetadataProps.colors,
      credentialType: summitCredMetadataProps.credentialType,
      id: id1,
      isArchived: false,
      issuanceDate: w3cCredentialRecord.credential.issuanceDate,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      cachedDetails: summitCredMetadataProps.cachedDetails,
      connectionType: ConnectionType.DIDCOMM,
    });
  });

  test("update metadata completed with connection successfully when credential is done", async () => {
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue(credentialMetadataRecordA);
    agent.w3cCredentials.getCredentialRecordById = jest
      .fn()
      .mockResolvedValue(w3cCredentialRecord);
    const dataAfterUpdate = await credentialService.updateMetadataCompleted(
      credentialDoneExchangeRecord
    );
    expect(dataAfterUpdate.status).toEqual(
      CredentialMetadataRecordStatus.CONFIRMED
    );
    expect(dataAfterUpdate.credentialType).toEqual(
      w3cCredentialRecord.credential.type[1]
    );
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
  test("can get unhandled credentials to re-processing", async () => {
    agent.credentials.findAllByQuery = jest
      .fn()
      .mockResolvedValueOnce([credentialOfferReceivedRecordAutoAccept]);
    agent.genericRecords.findAllByQuery = jest
      .fn()
      .mockResolvedValue(genericRecords);

    expect(await credentialService.getUnhandledCredentials()).toEqual(
      [
        [credentialOfferReceivedRecordAutoAccept],
        genericRecords.map((result) => {
          return {
            id: result.id,
            createdAt: result.createdAt,
            a: result.content,
          };
        }),
      ].flat()
    );
    expect(agent.credentials.findAllByQuery).toBeCalledWith({
      state: CredentialState.OfferReceived,
    });
  });
  test("get acdc credential details successfully record by id", async () => {
    const acdcMetadataRecord = {
      ...credentialMetadataRecordA,
      connectionType: ConnectionType.KERI,
    };
    agent.modules.generalStorage.getCredentialMetadata = jest
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
    agent.modules.signify.getCredentialBySaid = jest
      .fn()
      .mockResolvedValue({ acdc });

    await expect(
      credentialService.getCredentialDetailsById(acdcMetadataRecord.id)
    ).resolves.toStrictEqual({
      id: credentialMetadataRecordA.id,
      colors: credentialMetadataRecordA.colors,
      credentialType: acdcMetadataRecord.credentialType,
      issuanceDate: nowISO,
      cachedDetails: undefined,
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

  test("callback will run when have a event listener of ACDC KERI state changed", async () => {
    const callback = jest.fn();
    credentialService.onAcdcKeriStateChanged(callback);
    const event: AcdcKeriStateChangedEvent = {
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        credential: {
          id: "acdc",
          colors: ["#fff", "#fff"],
          issuanceDate: "dt",
          credentialType: "type",
          status: CredentialMetadataRecordStatus.CONFIRMED,
          connectionType: ConnectionType.KERI,
        },
        status: CredentialStatus.CONFIRMED,
      },
      metadata: {
        contextCorrelationId: id1,
      },
    };
    agent.eventEmitter.emit(AcdcKeriEventTypes.AcdcKeriStateChanged, event);
    expect(callback).toBeCalledWith(event);
  });

  test("can delete keri notification by ID", async () => {
    const id = "uuid";
    await credentialService.deleteKeriNotificationRecordById(id);
    expect(agent.genericRecords.deleteById).toBeCalled();
  });

  test("accept KERI ACDC", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockResolvedValue({
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
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue({
        signifyName: "holder",
      });
    agent.modules.signify.getCredentialBySaid = jest.fn().mockResolvedValue({
      acdc: {
        sad: {
          d: "id",
        },
      },
      error: undefined,
    });
    agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId =
      jest.fn().mockResolvedValue({
        id: "id",
      });
    await credentialService.acceptKeriAcdc(id);
    expect(agent.events.emit).toBeCalled();
    expect(agent.genericRecords.deleteById).toBeCalled();
  });

  test("Must throw an error when there's no KERI notification", async () => {
    const id = "not-found-id";
    agent.genericRecords.findById = jest.fn();
    await expect(credentialService.acceptKeriAcdc(id)).rejects.toThrowError(
      `${CredentialService.KERI_NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  test("Must throw 'Credential with given SAID not found on KERIA' when there's no KERI credential", async () => {
    const id = "not-found-id";
    agent.modules.signify.getCredentialBySaid = jest
      .fn()
      .mockResolvedValue({ credential: undefined, error: undefined });
    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_FOUND);
  });
  test("Must throw an error when there's error from Signigy-ts ", async () => {
    const id = "not-found-id";
    agent.modules.signify.getCredentialBySaid = jest.fn().mockResolvedValue({
      credential: undefined,
      error: new Error("Network error"),
    });
    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError();
  });

  test("Should call saveCredentialMetadataRecord when there are un-synced KERI credentials", async () => {
    agent.modules.signify.getCredentials = jest.fn().mockReturnValue([
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
    agent.modules.generalStorage.getAllCredentialMetadata = jest
      .fn()
      .mockReturnValue([]);
    await credentialService.syncACDCs();
    expect(
      agent.modules.generalStorage.saveCredentialMetadataRecord
    ).toBeCalledTimes(2);
  });

  test("can get credential short details by ID", async () => {
    const id = "testid";
    const credentialType = "TYPE-001";
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockReturnValue({
        id,
        status: CredentialMetadataRecordStatus.CONFIRMED,
        colors,
        credentialType,
        connectionType: ConnectionType.KERI,
        issuanceDate: nowISO,
        cachedDetails: undefined,
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
      cachedDetails: undefined,
    });
  });

  test("cannot get credential short details by ID if the credential does not exist", async () => {
    agent.modules.generalStorage.getCredentialMetadata = jest
      .fn()
      .mockResolvedValue(null);
    await expect(
      credentialService.getCredentialShortDetailsById("randomid")
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
  });

  test("can offer Keri Acdc when received the ipex apply", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockReturnValue({
      exn: {
        a: {
          s: "schemaSaid",
        },
        i: "i",
      },
    });
    agent.modules.signify.getCredentialsBySchema = jest
      .fn()
      .mockReturnValue([{}]);
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockReturnValue({
        signifyName: "abc123",
      });
    await credentialService.offerAcdc(id);
    expect(agent.modules.signify.offerAcdc).toBeCalledWith("abc123", "i", {});
  });

  test("can not offer Keri Acdc if the acdc is not existed", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockReturnValue({
      exn: {
        a: {
          s: "schemaSaid",
        },
        i: "i",
      },
    });
    agent.modules.signify.getCredentialsBySchema = jest
      .fn()
      .mockReturnValue([]);
    await expect(credentialService.offerAcdc(id)).rejects.toThrowError(
      CredentialService.CREDENTIAL_NOT_FOUND_WITH_SCHEMA
    );
  });

  test("can not offer Keri Acdc if aid is not existed", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockReturnValue({
      exn: {
        a: {
          s: "schemaSaid",
          i: "ai",
        },
        i: "i",
      },
    });
    agent.modules.signify.getCredentialsBySchema = jest
      .fn()
      .mockReturnValue([{}]);
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockReturnValue(null);
    agent.modules.signify.getIdentifierById = jest.fn().mockReturnValue(null);
    await expect(credentialService.offerAcdc(id)).rejects.toThrowError(
      CredentialService.AID_NOT_FOUND
    );
  });

  test("can grant Keri Acdc when received the ipex agree", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockReturnValue({
      exn: {
        a: {
          m: JSON.stringify({
            i: "i",
            acdc: {},
          }),
        },
        i: "i",
      },
    });
    agent.modules.signify.getCredentialBySaid = jest
      .fn()
      .mockReturnValue({ acdc: {} });
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockReturnValue({
        signifyName: "abc123",
      });
    await credentialService.grantApplyAcdc(id);
    expect(agent.modules.signify.grantAcdc).toBeCalledWith("abc123", "i", {});
  });

  test("can not grant Keri Acdc if aid is not existed", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockReturnValue({
      exn: {
        a: {
          m: JSON.stringify({
            i: "i",
            acdc: {},
          }),
        },
        i: "i",
      },
    });
    agent.modules.signify.getCredentialBySaid = jest
      .fn()
      .mockReturnValue({ acdc: {} });
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockReturnValue(null);
    agent.modules.signify.getIdentifierById = jest.fn().mockReturnValue(null);
    await expect(credentialService.grantApplyAcdc(id)).rejects.toThrowError(
      CredentialService.AID_NOT_FOUND
    );
  });

  test("can not grant Keri Acdc if acdc is not existed", async () => {
    const id = "uuid";
    const date = new Date();
    agent.genericRecords.findById = jest.fn().mockImplementation((id) => {
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
    agent.modules.signify.getKeriExchange = jest.fn().mockReturnValue({
      exn: {
        a: {
          m: JSON.stringify({
            i: "i",
            acdc: {},
          }),
        },
        i: "i",
      },
    });
    agent.modules.signify.getCredentialBySaid = jest
      .fn()
      .mockReturnValue({ acdc: undefined });
    await expect(credentialService.grantApplyAcdc(id)).rejects.toThrowError(
      CredentialService.CREDENTIAL_NOT_FOUND
    );
  });
});
