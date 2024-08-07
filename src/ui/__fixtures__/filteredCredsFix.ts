import { CredentialShortDetails } from "../../core/agent/services/credentialService.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/records/credentialMetadataRecord.types";

const filteredCredsFix: CredentialShortDetails[] = [
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
  {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    status: CredentialMetadataRecordStatus.CONFIRMED,
    schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  },
];

export { filteredCredsFix };
