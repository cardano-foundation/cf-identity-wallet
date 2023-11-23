import { CredentialShortDetails } from "../../core/agent/agent.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";

const filteredCredsFix: CredentialShortDetails[] = [
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    issuerLogo: "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg",
    colors: ["#FFBC60", "#FFA21F"],
    status: CredentialMetadataRecordStatus.CONFIRMED,
  },
  {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    issuanceDate: "2010-01-01T19:23:24Z",
    credentialType: "University Credential",
    issuerLogo: "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg",
    colors: ["#D9EDDF", "#ACD8B9"],
    status: CredentialMetadataRecordStatus.CONFIRMED,
  },
];

export { filteredCredsFix };
