import {
  ConnectionDetails,
  ConnectionStatus,
  ConnectionType,
} from "../../core/agent/agent.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import {
  ACDCDetails,
  W3CCredentialDetails,
} from "../../core/agent/services/credentialService.types";

const credsFixW3c: W3CCredentialDetails[] = [
  {
    id: "metadata:61397f5b-a048-42ad-b165-84d49f574d4c",
    colors: ["#ef8fb9", "#f5bcd5"],
    issuanceDate: "2024-01-24T16:20:26.497Z",
    credentialType: "UniversityDegreeCredential",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    cachedDetails: {
      degreeType: "BachelorDegree",
    },
    connectionType: 0,
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    connectionId: "7b5b7cae-ba19-4ad5-a4a7-32db96f52ae9",
    credentialSubject: {
      id: "did:key:z6Mkvdhigk2EwyFy1ZYNvVrwRZYGujePLha9zLkB9JNGshRg",
      name: "John Smith",
      degree: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
    proofType: "Ed25519Signature2018",
    proofValue:
      "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..lA7RYE786YdgsnaW98i0dydg_wMdDyRcIx5fiV0er02rfiQHlvjg-QrFyR_NQ8IRQZrOQ_d55WyY97dqW5i8BQ",
  },
  {
    id: "metadata:491bb132-91e7-4ce7-8e8e-52444e2ffb2b",
    colors: ["#ef8f99", "#f5bcc2"],
    issuanceDate: "2024-01-24T16:19:33.281Z",
    credentialType: "AccessPassCredential",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    cachedDetails: {
      summitType: "AccessPass",
      startDate: "November 2, 2023",
      endDate: "November 2, 2023",
      passId: "4c44c251-eaa3-4c77-be07-d378b7b98497",
    },
    connectionType: 0,
    type: ["VerifiableCredential", "AccessPassCredential"],
    connectionId: "dce76ad5-b40c-4d1d-8632-8151a32d6a3d",
    credentialSubject: {
      id: "did:key:z6Mkvdhigk2EwyFy1ZYNvVrwRZYGujePLha9zLkB9JNGshRg",
      type: "AccessPass",
      eventName: "Cardano Summit 2023",
      passId: "4c44c251-eaa3-4c77-be07-d378b7b98497",
      name: "John Smith",
      startDate: "November 2, 2023",
      endDate: "November 3, 2023",
      location: "Dubai, UAE",
    },
    proofType: "Ed25519Signature2018",
    proofValue:
      "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..BagLUeFaMa9KYkPDqbBbElVxxF_zoxLxSb15p10Sm7FGudUsAYMorcxSwEOdp1Mw94oEUI-tNi8b5sr-qi3ADA",
  },
  {
    id: "metadata:d0ea1b6b-bc49-4350-a0ee-46a0cdb87be1",
    colors: ["#af8fef", "#cfbcf5"],
    issuanceDate: "2024-01-24T16:21:09.451Z",
    credentialType: "PermanentResidentCard",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    cachedDetails: {
      expirationDate: "2025-12-12T12:12:12Z",
      image:
        "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/static/ResIdImg.jpg",
      givenName: "John",
      familyName: "Smith",
      birthCountry: "The Bahamas",
      lprCategory: "C09",
      residentSince: "2022-10-10T10:12:12Z",
    },
    connectionType: 0,
    type: ["VerifiableCredential", "PermanentResidentCard"],
    connectionId: "41610201-40eb-46bb-bc98-7ee73249156e",
    expirationDate: "2025-12-12T12:12:12Z",
    credentialSubject: {
      id: "did:key:z6MktNjjqFdTksu46nngQ1xhisB1J426DcjLSA1rKwYHzM4B",
      type: ["PermanentResident", "Person"],
      birthCountry: "The Bahamas",
      givenName: "John",
      familyName: "Smith",
      gender: "Male",
      image:
        "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/static/ResIdImg.jpg",
      residentSince: "2022-10-10T10:12:12Z",
      lprCategory: "C09",
      lprNumber: "999-999-999",
    },
    proofType: "Ed25519Signature2018",
    proofValue:
      "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..d4Q4yDkg_xDk3RDrggtKiiCLaUpY2Nnq4otLNXvAZZ9due3hu9ES6T3NrrUDAs6627uJLe-fUPbcg0chSNcQBA",
  },
];

const connectionDetailsFix: ConnectionDetails = {
  id: "test_id",
  label: "test_label",
  connectionDate: "2010-01-01T19:23:24Z",
  status: ConnectionStatus.CONFIRMED,
};

const credsFixAcdc: ACDCDetails[] = [
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    colors: ["#8fefba", "#bcf5d6"],
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    connectionType: ConnectionType.KERI,
    i: "EGvs2tol4NEtRvYFQDwzRJNnxZgAiGbM4iHB3h4gpRN5",
    a: {
      d: "EJ3HSnEqtSm3WiucWkeBbKspmEAIjf2N6wr5EKOcQ9Vl",
      i: "EJWgO4hwKxNMxu2aUpmGFMozKt9Eq2Jz8n-xXR7CYtY_",
      dt: "2024-01-22T16:03:44.643000+00:00",
      LEI: "5493001KJTIIGC8Y1R17",
    },
    s: {
      title: "Qualified vLEI Issuer Credential",
      description:
        "A vLEI Credential issued by GLEIF to Qualified vLEI Issuers which allows the Qualified vLEI Issuers to issue, verify and revoke Legal Entity vLEI Credentials and Legal Entity Official Organizational Role vLEI Credentials",
      version: "1.0.0",
    },
    lastStatus: {
      s: "0",
      dt: "2024-01-22T16:05:44.643Z",
    },
  },
];

export { credsFixW3c, credsFixAcdc, connectionDetailsFix };
