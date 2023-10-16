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

function resolveTagsFromDb(tagDb: string): Record<string, unknown> | null {
  const tags: Record<string, unknown> = {};
  const tagsParseArrays = tagDb?.split(",") || [];
  tagsParseArrays.forEach((tag: string) => {
    const tagParse = tag.split("|");
    switch (tagParse[0]) {
    case TagDataType.ARRAY: {
      if (tags[tagParse[1]]) {
        (tags[tagParse[1]] as Array<string>).push(tagParse[2]);
      } else {
        tags[tagParse[1]] = [tagParse[2]];
      }
      break;
    }
    case TagDataType.STRING: {
      tags[tagParse[1]] = tagParse[2];
      break;
    }
    case TagDataType.BOOLEAN: {
      tags[tagParse[1]] = tagParse[2] === "1" ? true : false;
      break;
    }
    default:
      throw new AriesFrameworkError(
        `Expected tag type to be in enum TagDataType, found ${tagParse[0]}`
      );
    }
  });
  return tags;
}

enum TagDataType {
  STRING = "string",
  ARRAY = "array",
  BOOLEAN = "boolean",
}

function isNilOrEmptyString(value: unknown): boolean {
  if (value == null || value === "") {
    return true;
  }
  return false;
}

function convertDbQuery<T extends BaseRecord>(
  params: Query<T>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [queryKey, queryVal] of Object.entries(params)) {
    if (isNilOrEmptyString(queryVal)) continue;
    if (typeof queryVal === "boolean") {
      result[queryKey] = queryVal ? "1" : "0";
      continue;
    }
    result[queryKey] = queryVal;
  }
  return result;
}

export {
  assertSqliteStorageWallet,
  deserializeRecord,
  resolveTagsFromDb,
  TagDataType,
  convertDbQuery,
  isNilOrEmptyString,
};
