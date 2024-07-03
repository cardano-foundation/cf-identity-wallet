interface CredentialsMatchingApply {
  schema: {
    name: string;
    description: string;
    attributes: Record<string, unknown>;
  };
  credentials: {
    connectionId: string;
    acdc: any;
  }[];
}

export type { CredentialsMatchingApply };
