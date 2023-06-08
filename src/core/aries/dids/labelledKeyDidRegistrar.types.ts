import { DidCreateOptions, KeyType } from "@aries-framework/core";
import { IdentityType } from "../ariesAgent.types";

interface LabelledKeyDidCreateOptions extends DidCreateOptions {
  method: IdentityType.KEY;
  did?: never;
  didDocument?: never;
  options: {
    keyType: KeyType;
  };
  secret?: never;
  displayName: string;
}

export type { LabelledKeyDidCreateOptions };
