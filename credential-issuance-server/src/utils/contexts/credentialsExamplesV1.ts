const CREDENTIALS_EXAMPLES_V1 = {
  "@context": [{
    "@version": 1.1
  },"https://www.w3.org/ns/odrl.jsonld", {
    "ex": "https://example.org/examples#",
    "schema": "http://schema.org/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",

    "3rdPartyCorrelation": "ex:3rdPartyCorrelation",
    "AllVerifiers": "ex:AllVerifiers",
    "Archival": "ex:Archival",
    "BachelorDegree": "ex:BachelorDegree",
    "Child": "ex:Child",
    "CLCredentialDefinition2019": "ex:CLCredentialDefinition2019",
    "CLSignature2019": "ex:CLSignature2019",
    "IssuerPolicy": "ex:IssuerPolicy",
    "HolderPolicy": "ex:HolderPolicy",
    "Mother": "ex:Mother",
    "RelationshipCredential": "ex:RelationshipCredential",
    "UniversityDegreeCredential": "ex:UniversityDegreeCredential",
    "AlumniCredential": "ex:AlumniCredential",
    "DisputeCredential": "ex:DisputeCredential",
    "PrescriptionCredential": "ex:PrescriptionCredential",
    "ZkpExampleSchema2018": "ex:ZkpExampleSchema2018",

    "issuerData": "ex:issuerData",
    "attributes": "ex:attributes",
    "signature": "ex:signature",
    "signatureCorrectnessProof": "ex:signatureCorrectnessProof",
    "primaryProof": "ex:primaryProof",
    "nonRevocationProof": "ex:nonRevocationProof",

    "alumniOf": {"@id": "schema:alumniOf", "@type": "rdf:HTML"},
    "child": {"@id": "ex:child", "@type": "@id"},
    "degree": "ex:degree",
    "degreeType": "ex:degreeType",
    "degreeSchool": "ex:degreeSchool",
    "college": "ex:college",
    "name": {"@id": "schema:name", "@type": "rdf:HTML"},
    "givenName": "schema:givenName",
    "familyName": "schema:familyName",
    "parent": {"@id": "ex:parent", "@type": "@id"},
    "referenceId": "ex:referenceId",
    "documentPresence": "ex:documentPresence",
    "evidenceDocument": "ex:evidenceDocument",
    "spouse": "schema:spouse",
    "subjectPresence": "ex:subjectPresence",
    "verifier": {"@id": "ex:verifier", "@type": "@id"},
    "currentStatus": "ex:currentStatus",
    "statusReason": "ex:statusReason",
    "prescription": "ex:prescription"
  }]
}

export { CREDENTIALS_EXAMPLES_V1 }