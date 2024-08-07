import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../core/agent/services/credentialService.types";

const shortCredsFix: CredentialShortDetails[] = [
  {
    credentialType: "UniversityDegreeCredential",
    id: "metadata:61397f5b-a048-42ad-b165-84d49f574d4c",
    isArchived: false,
    issuanceDate: "2024-01-24T16:20:26.497Z",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    credentialType: "AccessPassCredential",
    id: "metadata:491bb132-91e7-4ce7-8e8e-52444e2ffb2b",
    isArchived: false,
    issuanceDate: "2024-01-24T16:19:33.281Z",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    credentialType: "PermanentResidentCard",
    id: "metadata:d0ea1b6b-bc49-4350-a0ee-46a0cdb87be1",
    isArchived: false,
    issuanceDate: "2024-01-24T16:21:09.451Z",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    issuanceDate: "2024-01-22T16:03:44.643Z",
    credentialType: "Qualified vLEI Issuer Credential",
    status: CredentialStatus.PENDING,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF2-ghumzCJ6nv",
    issuanceDate: "2024-01-23T16:03:44.643Z",
    credentialType: "Rare EVO 2024 Attendee",
    status: CredentialStatus.CONFIRMED,
    schema: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
  },
  {
    id: "metadata:EKfweht5lOkjaguB5dz42BMkfejhBFIF3-ghumzCJ6nv",
    issuanceDate: "2024-01-23T16:03:44.643Z",
    credentialType: "Rare EVO 2024 Attendee",
    status: CredentialStatus.PENDING,
    schema: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
  },
];

export { shortCredsFix };
