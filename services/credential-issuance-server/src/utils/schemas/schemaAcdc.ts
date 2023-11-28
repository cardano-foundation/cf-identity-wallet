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
};

export { SCHEMA_ACDC };
