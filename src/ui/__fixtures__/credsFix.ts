import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { CredentialDetails } from "../../core/agent/services/credentialService.types";

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

const universityCredentials = {
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
};

const residenceCredentials = {
  id: "metadata:e7363c7d-1d23-46ad-aea3-b4d224bf35fd",
  colors: ["#9fef8f", "#c6f5bc"],
  issuanceDate: "2023-10-25T13:12:16.773Z",
  credentialType: "PermanentResidentCard",
  status: "confirmed",
  type: ["VerifiableCredential", "PermanentResidentCard"],
  connectionId: "d8dc33ba-7234-4989-87e2-e96d674d74ef",
  expirationDate: "2025-12-12T12:12:12Z",
  credentialSubject: {
    id: "did:key:z6MktNjjqFdTksu46nngQ1xhisB1J426DcjLSA1rKwYHzM4B",
    type: ["PermanentResident", "Person"],
    birthCountry: "The Bahamas",
    givenName: "John",
    familyName: "Smith",
    gender: "Male",
    image: "static/johnsmith_photo.jpg",
    residentSince: "2022-10-10T10:12:12Z",
    lprCategory: "C09",
    lprNumber: "999-999-999",
  },
  proofType: "Ed25519Signature2018",
  proofValue:
    "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..gYBknKig0P88Z-CGhu8his1G9dRsZd1UqhVJOT51To3iKZ9m24MC152-u0QgNXOe4Z_QaWDByA20-1ilg3a4Dw",
};

export { credsFix };
