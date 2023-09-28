import { CredentialDetails } from "../../core/agent/agent.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";

const credsFix: CredentialDetails[] = [
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    type: ["UniversityDegreeCredential"],
    connection: "idHere",
    issuanceDate: "2010-01-01T19:23:24Z",
    expirationDate: "2012-01-01T19:23:24Z",
    receivingDid: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    credentialType: "University Credential",
    issuerLogo: "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg",
    credentialSubject: {
      degree: {
        education: "Degree",
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
    proofType: "Ed25519Signature2020",
    proofValue:
      "z58DAdFfa9SkqZMVZs6ZjWp1CktyGesjuTSwRdoWhPxAQpic7ndSayn1PzAfGFCF5bppETSTojQCrfFPP2oumHKtz",
    credentialStatus: {
      revoked: false,
      suspended: false,
    },
    colors: ["#FFBC60", "#FFA21F"],
    status: CredentialMetadataRecordStatus.CONFIRMED,
  },
  {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    type: ["UniversityDegreeCredential"],
    connection: "idHere",
    issuanceDate: "2010-01-01T19:23:24Z",
    expirationDate: "2012-01-01T19:23:24Z",
    receivingDid: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    credentialType: "University Credential",
    issuerLogo: "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg",
    credentialSubject: {
      degree: {
        education: "Degree",
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
    proofType: "Ed25519Signature2020",
    proofValue:
      "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSwRdoWhAfGFCF5bppETSTojQCrfFPP2oumHKtz",
    credentialStatus: {
      revoked: false,
      suspended: false,
    },
    colors: ["#D9EDDF", "#ACD8B9"],
    status: CredentialMetadataRecordStatus.CONFIRMED,
  },
];

export { credsFix };
