import type {
  BaseRecord,
  BaseRecordConstructor,
  Query,
} from "@aries-framework/core";
import {
  JsonTransformer,
  Wallet,
  AriesFrameworkError,
  TagsBase,
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
  // Our tags aren't encrypted and for now we want to keep the WQL simple so they are directly transferred.
  // This means we are incompatible with Askar, but a migration script can convert the tags.
  const instance = JsonTransformer.deserialize<T>(
    record.value as string,
    recordClass
  );
  instance.replaceTags(record.tags as TagsBase);
  instance.id = record.name;
  return instance;
}

export { assertIonicStorageWallet, deserializeRecord };
