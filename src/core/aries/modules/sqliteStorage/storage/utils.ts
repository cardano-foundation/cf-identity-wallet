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

function resolveTagsFromDb(tagDb: string): Record<string, unknown> | null {
  let tags: Record<string, unknown> = {};
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
}

export {
  assertSqliteStorageWallet,
  deserializeRecord,
  resolveTagsFromDb,
  TagDataType,
};
