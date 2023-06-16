const credsMock = [
  {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
    ],
    id: "http://example.edu/credentials/3732",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    issuer: "did:xyz:abcdef123",
    issuanceDate: "2010-01-01T19:23:24Z",
    expirationDate: "2012-01-01T19:23:24Z",
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      degree: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
    credentialSchema: {
      id: "https://example.org/examples/degree.json",
      type: "JsonSchemaValidator2018",
    },
    credentialStatus: {
      id: "https://example.com/credentials/status/3#94567",
      type: "StatusList2021Entry",
      statusPurpose: "revocation",
      statusListIndex: "94567",
      statusListCredential: "https://example.com/credentials/status/3",
    },
    proof: {
      type: "Ed25519Signature2020",
      created: "2021-11-13T18:19:39Z",
      verificationMethod: "https://example.edu/issuers/14#key-1",
      proofPurpose: "assertionMethod",
      proofValue:
        "z58DAdFfa9SkqZMVPxAQpic7ndSayn1PzZs6ZjWp1CktyGesjuTSwRdoWhAfGFCF5bppETSTojQCrfFPP2oumHKtz",
    },
  },
];

export { credsMock };
