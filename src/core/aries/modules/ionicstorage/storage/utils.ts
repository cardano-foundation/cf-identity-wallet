import type { BaseRecord, BaseRecordConstructor } from "@aries-framework/core";
import {
  JsonTransformer,
  Wallet,
  AriesFrameworkError,
} from "@aries-framework/core";
import { IonicStorageWallet } from "../wallet";
import { StorageObject } from "./ionicStorageService.types";

function assertIonicStorageWallet(
  wallet: Wallet
): asserts wallet is IonicStorageWallet {
  if (!(wallet instanceof IonicStorageWallet)) {
    throw new AriesFrameworkError(
      `Expected wallet to be instance of IonicStorageWallet, found ${wallet.constructor.name}`
    );
  }
}

function deserializeRecord<T extends BaseRecord>(
  record: StorageObject,
  recordClass: BaseRecordConstructor<T>
): T {
  // @TODO - foconnor: Tag conversion must be implemented when needed.
  const instance = JsonTransformer.deserialize<T>(
    record.value as string,
    recordClass
  );
  instance.id = record.name;
  return instance;
}

export { assertIonicStorageWallet, deserializeRecord };
