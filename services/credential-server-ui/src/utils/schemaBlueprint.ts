const ATTRIBUTES_BLOCK = {
  oneOf: [
    { description: "Attributes block SAID", type: "string" },
    {
      $id: "string",
      description: "Attributes block",
      type: "object",
      properties: {
        d: { description: "Attributes block SAID", type: "string" },
        i: { description: "Issuer AID", type: "string" },
        dt: { description: "Issuance date time", type: "string", format: "date-time" },
      },
      additionalProperties: false,
      required: ["i", "dt"],
    },
  ],
};

const EDGES_BLOCK = {
  oneOf: [
    { description: "Edges block SAID", type: "string" },
    {
      $id: "string",
      description: "Edges block",
      type: "object",
      properties: {
        d: { description: "Edges block SAID", type: "string" },
      },
      additionalProperties: false,
      required: ["d"],
    },
  ],
};

const RULES_BLOCK = {
  oneOf: [
    { description: "Rules block SAID", type: "string" },
    {
      $id: "string",
      description: "Rules block",
      type: "object",
      properties: {
        d: { description: "Rules block SAID", type: "string" },
      },
      additionalProperties: false,
      required: ["d"],
    },
  ],
};

const GENERATE_SCHEMA_BLUEPRINT = {
  $id: "string",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "string",
  description: "string",
  type: "object",
  credentialType: "string",
  version: "1.0.0",
  properties: {
    v: { description: "Version", type: "string" },
    d: { description: "Credential SAID", type: "string" },
    u: { description: "One time use nonce", type: "string" },
    i: { description: "Issuer AID", type: "string" },
    ri: { description: "Credential status registry", type: "string" },
    s: { description: "Schema SAID", type: "string" },
  },
  additionalProperties: false,
  required: ["i", "ri", "s", "d"],
};

export { GENERATE_SCHEMA_BLUEPRINT, ATTRIBUTES_BLOCK, EDGES_BLOCK, RULES_BLOCK };
