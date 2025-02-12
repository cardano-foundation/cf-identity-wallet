export enum CredentialType {
  RARE_EVO = "Rare EVO Attendee",
  GLEIF = "Qualified vLEI Issuer",
  LE = "Legal Entity",
}
export const SCHEMA_SAID = {
  [CredentialType.RARE_EVO]: "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb",
  [CredentialType.GLEIF]: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  [CredentialType.LE]: "ENPXp1vQzRF6JwIuS-mp2U8Uf1MoADoP_GqQ62VsDZWY",
};

export const Attributes = {
  [CredentialType.RARE_EVO]: [
    {
      key: "attendeeName",
      label: "Name",
    },
  ],
  [CredentialType.GLEIF]: [
    {
      key: "LEI",
      label: "LEI",
    },
  ],
  [CredentialType.LE]: [
    {
      key: "LEI",
      label: "LEI",
    },
  ],
};

export const credentialTypes = [
  CredentialType.RARE_EVO,
  CredentialType.GLEIF,
  CredentialType.LE,
];

export const UUID_REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
