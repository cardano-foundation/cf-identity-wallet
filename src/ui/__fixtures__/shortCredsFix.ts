import { CredentialShortDetails } from "../../core/agent/services/credentialService.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/records/credentialMetadataRecord.types";

const shortCredsFix: CredentialShortDetails[] = [
  {
    colors: ["#ef8fb9", "#f5bcd5"],
    credentialType: "UniversityDegreeCredential",
    id: "metadata:61397f5b-a048-42ad-b165-84d49f574d4c",
    isArchived: false,
    issuanceDate: "2024-01-24T16:20:26.497Z",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    connectionType: 0,
    cachedDetails: {
      degreeType: "BachelorDegree",
    },
  },
  {
    colors: ["#ef8f99", "#f5bcc2"],
    credentialType: "AccessPassCredential",
    id: "metadata:491bb132-91e7-4ce7-8e8e-52444e2ffb2b",
    isArchived: false,
    issuanceDate: "2024-01-24T16:19:33.281Z",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    connectionType: 0,
    cachedDetails: {
      summitType: "AccessPass",
      startDate: "November 2, 2023",
      endDate: "November 2, 2023",
      passId: "4c44c251-eaa3-4c77-be07-d378b7b98497",
    },
  },
  {
    colors: ["#af8fef", "#cfbcf5"],
    credentialType: "PermanentResidentCard",
    id: "metadata:d0ea1b6b-bc49-4350-a0ee-46a0cdb87be1",
    isArchived: false,
    issuanceDate: "2024-01-24T16:21:09.451Z",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    connectionType: 0,
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
  },
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    colors: ["#8fefba", "#bcf5d6"],
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    connectionType: 1,
  },
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    colors: ["#8fefba", "#bcf5d6"],
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialMetadataRecordStatus.PENDING,
    connectionType: 1,
  },
];

export { shortCredsFix };
