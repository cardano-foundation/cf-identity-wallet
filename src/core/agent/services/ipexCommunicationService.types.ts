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
}

export type { CredentialsMatchingApply };
