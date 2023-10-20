import { CredentialDetails } from "../../core/agent/agent.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";

const credsFix: CredentialDetails[] = [
  {
    id: "did:example:ebfeb1ebc6f1c276ef71212ec21",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    connectionId: "idHere",
    issuanceDate: "2010-01-01T19:23:24Z",
    expirationDate: "2012-01-01T19:23:24Z",
    credentialType: "University Credential",
    issuerLogo: "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg",
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      type: "BachelorDegree",
      name: "Bachelor of Science and Arts",
    },
    proofType: "Ed25519Signature2020",
    proofValue:
      "z58DAdFfa9SkqZMVZs6ZjWp1CktyGesjuTSwRdoWhPxAQpic7ndSayn1PzAfGFCF5bppETSTojQCrfFPP2oumHKtz",
    colors: ["#FFBC60", "#FFA21F"],
    status: CredentialMetadataRecordStatus.CONFIRMED,
  },
  {
    id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    connectionId: "idHere",
    issuanceDate: "2010-01-01T19:23:24Z",
    expirationDate: "2012-01-01T19:23:24Z",
    credentialType: "University Credential",
    issuerLogo: "https://www.w3.org/Icons/WWW/w3c_home_nb-v.svg",
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      type: "BachelorDegree",
      name: "Bachelor of Science and Arts",
    },
    proofType: "Ed25519Signature2020",
    proofValue:
      "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSwRdoWhAfGFCF5bppETSTojQCrfFPP2oumHKtz",
    colors: ["#D9EDDF", "#ACD8B9"],
    status: CredentialMetadataRecordStatus.CONFIRMED,
  },
];

const universityDegreeCredential = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1",
  ],
  type: ["VerifiableCredential", "UniversityDegreeCredential"],
  credentialSubject: {
    id: "did:key:z6Mkvdhigk2EwyFy1ZYNvVrwRZYGujePLha9zLkB9JNGshRg",
    name: "John Smith",
    degree: {
      type: "BachelorDegree",
      name: "Bachelor of Science and Arts",
    },
  },
  expirationDate: "2025-12-11T11:11:11Z",
};

export { credsFix, universityDegreeCredential };
