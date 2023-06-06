import { DidCreateOptions, KeyType } from "@aries-framework/core";
import { IdentityType } from "../ariesAgent.types";

interface CustomKeyDidCreateOptions extends DidCreateOptions {
  method: IdentityType.KEY;
  did?: never;
  didDocument?: never;
  options: {
    keyType: KeyType;
  };
  secret?: never;
  displayName: string;
}

export type { CustomKeyDidCreateOptions };
