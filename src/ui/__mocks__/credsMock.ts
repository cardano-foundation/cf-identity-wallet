const credsMock = [
  {
    type: ["UniversityDegreeCredential"],
    connection: "idHere",
    issuanceDate: "2010-01-01T19:23:24Z",
    expirationDate: "2012-01-01T19:23:24Z",
    receivingDid: "did:example:ebfeb1f712ebc6f1c276e12ec21",
    credentialType: "University Credential",
    nameOnCredential: "Thomas A. Mayfield",
    issuerLogo: "https://placehold.co/120x22",
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
    colors: ["#FFBC60", "#FFA21F"],
  },
];

export { credsMock };
