import { memberIdentifierRecord } from "../../core/__fixtures__/agent/multSigFixtures";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../core/agent/services/credentialService.types";
import { IdentifierType } from "../../core/agent/services/identifier.types";

const shortCredsFix: CredentialShortDetails[] = [
  {
    credentialType: "UniversityDegreeCredential",
    id: "61397f5b-a048-42ad-b165-84d49f574d4c",
    isArchived: false,
    issuanceDate: "2024-01-24T16:20:26.497Z",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    identifierType: IdentifierType.Individual,
    identifierId: memberIdentifierRecord.id,
  },
  {
    credentialType: "AccessPassCredential",
    id: "491bb132-91e7-4ce7-8e8e-52444e2ffb2b",
    isArchived: false,
    issuanceDate: "2024-01-24T16:19:33.281Z",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    identifierType: IdentifierType.Individual,

    identifierId: memberIdentifierRecord.id,
  },
  {
    credentialType: "PermanentResidentCard",
    id: "d0ea1b6b-bc49-4350-a0ee-46a0cdb87be1",
    isArchived: false,
    issuanceDate: "2024-01-24T16:21:09.451Z",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    identifierType: IdentifierType.Individual,
    identifierId: memberIdentifierRecord.id,
  },
  {
    id: "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    identifierType: IdentifierType.Individual,
    identifierId: memberIdentifierRecord.id,
  },
  {
    id: "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialStatus.PENDING,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    identifierType: IdentifierType.Individual,
    identifierId: memberIdentifierRecord.id,
  },
  {
    id: "EKfweht5lOkjaguB5dz42BMkfejhBFIF2-ghumzCJ6nv",
    issuanceDate: "2024-01-23T16:03:44.643Z",
    credentialType: "Rare EVO 2024 Attendee",
    status: CredentialStatus.CONFIRMED,
    schema: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
    identifierType: IdentifierType.Individual,
    identifierId: memberIdentifierRecord.id,
  },
  {
    id: "EKfweht5lOkjaguB5dz42BMkfejhBFIF3-ghumzCJ6nv",
    issuanceDate: "2024-01-23T16:03:44.643Z",
    credentialType: "Rare EVO 2024 Attendee",
    status: CredentialStatus.PENDING,
    schema: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
    identifierType: IdentifierType.Individual,
    identifierId: memberIdentifierRecord.id,
  },
];

export { shortCredsFix };
