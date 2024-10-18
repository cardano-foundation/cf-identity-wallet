interface CredentialsMatchingApply {
  schema: {
    name: string;
    description: string;
  };
  credentials: {
    connectionId: string;
    acdc: any;
  }[];
  attributes: Record<string, unknown>;
  identifier: string;
}

export type { CredentialsMatchingApply };
