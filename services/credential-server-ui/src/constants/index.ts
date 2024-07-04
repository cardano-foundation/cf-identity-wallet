export enum CredentialType {
  IIW = "IIW Attendee",
  GLEIF = "Qualified vLEI Issuer",
}

export const Attributes = {
  [CredentialType.IIW]: [
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
};

export const credentialTypes = [CredentialType.IIW, CredentialType.GLEIF];

export const UUID_REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
