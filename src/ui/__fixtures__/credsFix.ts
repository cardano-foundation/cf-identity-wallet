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

const w3cUniversityCredentials = {
  withConnection: {
    id: "metadata:e140217a-9ead-41f2-be3e-41841f531039",
    colors: ["#efa18f", "#f5c7bc"],
    issuanceDate: "2023-10-24T09:07:14.901Z",
    credentialType: "UniversityDegreeCredential",
    status: "confirmed",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    connectionId: "1eb57b02-8cc9-4509-a34a-d1342280e589",
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
      "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..m1c7d46h-f0CqxF5NVmb8_ODt03uaIj24LxX5-9d5NuPug7Z4nQa_dOIrAkER0vN9f08-HmskIm3Wu3uMKhLAg",
  },
  withoutConnection: {
    id: "metadata:c78f18b1-09a9-456a-a83e-f15c22096f42",
    colors: ["#d18fef", "#e3bcf5"],
    issuanceDate: "2023-10-24T09:07:52.981Z",
    credentialType: "UniversityDegreeCredential",
    status: "confirmed",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
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
      "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..tfAudjj2Wr9U677fNOCJPE8vvdPSF7OocDQo1aPypgZnZaT-dFOD6ULB9MDz6y6LmAj9I-OIhrHA4JOgOakADw",
  },
};

export { credsFix };
