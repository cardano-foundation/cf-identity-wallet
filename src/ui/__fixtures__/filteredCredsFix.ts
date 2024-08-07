import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../core/agent/services/credentialService.types";

const filteredCredsFix: CredentialShortDetails[] = [
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialStatus.CONFIRMED,
  },
  {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialStatus.CONFIRMED,
  },
];

export { filteredCredsFix };
