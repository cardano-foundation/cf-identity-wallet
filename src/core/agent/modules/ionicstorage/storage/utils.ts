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

function checkRecordIsValidWithQuery<T extends BaseRecord>(
  record: any,
  query: Query<T>
): boolean {
  for (const [queryKey, queryVal] of Object.entries(query)) {
    if (queryKey === "$or") {
      if (
        !queryVal.some((query: Query<T>) =>
          checkRecordIsValidWithQuery(record, query)
        )
      ) {
        return false;
      }
    } else if (queryKey === "$not") {
      if (checkRecordIsValidWithQuery(record, queryVal)) {
        return false;
      }
    } else {
      if (Array.isArray(queryVal) && queryVal.length > 0) {
        // compare them item by item
        const check = queryVal.every((element) =>
          record.tags?.[queryKey]?.includes(element)
        );
        if (!check) {
          return false;
        }
      } else if (record.tags[queryKey] !== queryVal && queryVal !== undefined) {
        return false;
      }
    }
  }
  return true;
}

function isObject(value: any): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export {
  assertIonicStorageWallet,
  deserializeRecord,
  checkRecordIsValidWithQuery,
};
