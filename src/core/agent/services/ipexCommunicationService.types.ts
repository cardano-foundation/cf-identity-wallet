interface CredentiasMatchingApply {
  schema: {
    name: string;
    description: string;
  } | null;
  credentials: {
    connectionId?: string;
    acdc: any;
  }[];
}

export type { CredentiasMatchingApply };
