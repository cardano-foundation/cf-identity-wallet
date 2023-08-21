import type { BaseRecord, BaseRecordConstructor } from "@aries-framework/core";
import {
  JsonTransformer,
  Wallet,
  AriesFrameworkError,
  TagsBase,
} from "@aries-framework/core";
import { SqliteStorageWallet } from "../wallet";
import { StorageObject } from "./sqliteStorageService.types";

function assertSqliteStorageWallet(
  wallet: Wallet
): asserts wallet is SqliteStorageWallet {
  if (!(wallet instanceof SqliteStorageWallet)) {
    throw new AriesFrameworkError(
      `Expected wallet to be instance of SqlitetorageWallet, found ${wallet.constructor.name}`
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


export { assertSqliteStorageWallet, deserializeRecord };
