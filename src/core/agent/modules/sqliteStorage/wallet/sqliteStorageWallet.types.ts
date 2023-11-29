import { KeyType } from "@aries-framework/core";

interface KeyPairEntry {
  name: string;
  value: {
    publicKeyBase58: string;
    privateKeyBase58: string;
    keyType: KeyType;
  };
  tags: Record<string, unknown>;
  category: string;
}

interface JweRecipient {
  encrypted_key: string;
  header?: {
    kid: string;
    sender?: string;
    iv?: string;
  };
}

export type { KeyPairEntry, JweRecipient };
