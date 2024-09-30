import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../core/agent/services/credentialService.types";

const filteredCredsFix: CredentialShortDetails[] = [
  {
    id: "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6nv",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    id: "EKfweht5lOkjaguB5dz42BMkfejhBFIF9-ghumzCJ6wv",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
];

const revokedCredsFix: CredentialShortDetails[] = [
  {
    id: "EBgG1lhkxiv_UQ8IiF2G4j5HQlnT5K5XZy_zRFg_EGCS",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialStatus.REVOKED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
];

export { filteredCredsFix, revokedCredsFix };
