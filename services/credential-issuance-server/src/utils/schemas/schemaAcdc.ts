const SCHEMA_ACDC = {
  "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao": {
    $id: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Qualified vLEI Issuer Credential",
    description:
      "A vLEI Credential issued by GLEIF to Qualified vLEI Issuers which allows the Qualified vLEI Issuers to issue, verify and revoke Legal Entity vLEI Credentials and Legal Entity Official Organizational Role vLEI Credentials",
    type: "object",
    credentialType: "QualifiedvLEIIssuervLEICredential",
    version: "1.0.0",
    properties: {
      v: { description: "Version", type: "string" },
      d: { description: "Credential SAID", type: "string" },
      u: { description: "One time use nonce", type: "string" },
      i: { description: "GLEIF Issuee AID", type: "string" },
      ri: { description: "Credential status registry", type: "string" },
      s: { description: "Schema SAID", type: "string" },
      a: {
        oneOf: [
          { description: "Attributes block SAID", type: "string" },
          {
            $id: "ELGgI0fkloqKWREXgqUfgS0bJybP1LChxCO3sqPSFHCj",
            description: "Attributes block",
            type: "object",
            properties: {
              d: { description: "Attributes block SAID", type: "string" },
              i: { description: "QVI Issuee AID", type: "string" },
              dt: {
                description: "Issuance date time",
                type: "string",
                format: "date-time",
              },
              LEI: {
                description: "LEI of the requesting Legal Entity",
                type: "string",
                format: "ISO 17442",
              },
              gracePeriod: {
                description: "Allocated grace period",
                type: "integer",
                default: 90,
              },
            },
            additionalProperties: false,
            required: ["i", "dt", "LEI"],
          },
        ],
      },
      r: {
        oneOf: [
          { description: "Rules block SAID", type: "string" },
          {
            $id: "ECllqarpkZrSIWCb97XlMpEZZH3q4kc--FQ9mbkFMb_5",
            description: "Rules block",
            type: "object",
            properties: {
              d: { description: "Rules block SAID", type: "string" },
              usageDisclaimer: {
                description: "Usage Disclaimer",
                type: "object",
                properties: {
                  l: {
                    description: "Associated legal language",
                    type: "string",
                    const:
                      "Usage of a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, does not assert that the Legal Entity is trustworthy, honest, reputable in its business dealings, safe to do business with, or compliant with any laws or that an implied or expressly intended purpose will be fulfilled.",
                  },
                },
              },
              issuanceDisclaimer: {
                description: "Issuance Disclaimer",
                type: "object",
                properties: {
                  l: {
                    description: "Associated legal language",
                    type: "string",
                    const:
                      "All information in a valid, unexpired, and non-revoked vLEI Credential, as defined in the associated Ecosystem Governance Framework, is accurate as of the date the validation process was complete. The vLEI Credential has been issued to the legal entity or person named in the vLEI Credential as the subject; and the qualified vLEI Issuer exercised reasonable care to perform the validation process set forth in the vLEI Ecosystem Governance Framework.",
                  },
                },
              },
            },
            additionalProperties: false,
            required: ["d", "usageDisclaimer", "issuanceDisclaimer"],
          },
        ],
      },
    },
    additionalProperties: false,
    required: ["i", "ri", "s", "d"],
  }, 
  "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu": {
    $id: "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "IIW 2024 Demo Day Attendee",
    description: "This Trust Over IP (ToIP) Authentic Chained Data Container (ACDC) Credential provides an end-verifiable attestation that the holder attended the Internet Identity Workshop (IIW) on April 16 - 18, 2024, and participated in the Cardano Foundation's Mobile Key Event Receipt Infrastructure (KERI) Wallet demonstration.",
    type: "object",
    credentialType: "DomainCredential",
    version: "1.0.0",
    properties: {
      v: {
        description: "Version",
        type: "string"
      },
      d: {
        description: "Credential SAID",
        type: "string"
      },
      u: {
        description: "One time use nonce",
        type: "string"
      },
      i: {
        description: "Issuee AID",
        type: "string"
      },
      ri: {
        description: "Credential status registry",
        type: "string"
      },
      s: {
        description: "Schema SAID",
        type: "string"
      },
      a: {
        oneOf: [
          {
            description: "Attributes block SAID",
            type: "string"
          },
          {
            $id: "EMNYoCwqUTqRgqqYh4Wg5UuLSr7PncFZ6RUx1vdnqxJs",
            description: "Attributes block",
            type: "object",
            properties: {
              d: {
                description: "Attributes block SAID",
                type: "string"
              },
              i: {
                description: "Issuee AID",
                type: "string"
              },
              dt: {
                description: "Issuance date time",
                type: "string",
                format: "date-time"
              },
              attendeeName: {
                description: "The name of the attendee",
                type: "string"
              }
            },
            additionalProperties: false,
            required: [
              "i",
              "dt",
              "attendeeName"
            ]
          }
        ]
      }
    },
    additionalProperties: false,
    required: [
      "i",
      "ri",
      "s",
      "d"
    ]
  },
  "EGjD1gCLi9ecZSZp9zevkgZGyEX_MbOdmhBFt4o0wvdb": {
    $id: "EGjD1gCLi9ecZSZp9zevkgZGyEX_MbOdmhBFt4o0wvdb",
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Domain registration credential",
    description: "A credential issued for domain registration purposes",
    type: "object",
    credentialType: "DomainCredential",
    version: "1.0.0",
    properties: {
      v: {
        description: "Version",
        type: "string",
      },
      d: {
        description: "Credential SAID",
        type: "string",
      },
      u: {
        description: "One time use nonce",
        type: "string",
      },
      i: {
        description: "Issuee AID",
        type: "string",
      },
      ri: {
        description: "Credential status registry",
        type: "string",
      },
      s: {
        description: "Schema SAID",
        type: "string",
      },
      a: {
        oneOf: [
          {
            description: "Attributes block SAID",
            type: "string",
          },
          {
            $id: "EBeI53glWgRv27Rt_r-D5aXIGBTPVO3jMV7QQKkQzA2n",
            description: "Attributes block",
            type: "object",
            properties: {
              d: {
                description: "Attributes block SAID",
                type: "string",
              },
              i: {
                description: "Issuee AID",
                type: "string",
              },
              dt: {
                description: "Issuance date time",
                type: "string",
                format: "date-time",
              },
              domain: {
                description: "The domain address",
                type: "string",
              },
            },
            additionalProperties: false,
            required: ["i", "dt", "domain"],
          },
        ],
      },
    },
    additionalProperties: false,
    required: ["i", "ri", "s", "d"],
  }
};

export { SCHEMA_ACDC };
