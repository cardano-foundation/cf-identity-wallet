const GENERATE_SCHEMA_BLUEPRINT = {
  $id: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "",
  description: "",
  type: "object",
  credentialType: "",
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
  },
  additionalProperties: false,
  required: ["i", "ri", "s", "d"],
};

export { GENERATE_SCHEMA_BLUEPRINT };
