import { BasicRecord } from "../../agent/records";
import { Query } from "../storage.types";
import { MIGRATIONS } from "./migrations";

function getUnMigrationSqls(
  currentVersion: string
): { sqls: string[]; latestVersion: string } | null {
  const versionArr: string[] = [];
  MIGRATIONS.forEach((migration) => {
    versionArr.push(migration.version);
  });
  versionArr.sort((a, b) => versionCompare(a, b));
  const latestVersion = versionArr[versionArr.length - 1];
  if (versionCompare(latestVersion, currentVersion) == 0) {
    return null;
  }
  const sqlUnMigrations: string[] = [];
  MIGRATIONS.forEach((migration) => {
    if (versionCompare(currentVersion, migration.version) == -1) {
      sqlUnMigrations.push(...migration.sql);
    }
  });
  return { sqls: sqlUnMigrations, latestVersion };
}

function isValidPart(x: string): boolean {
  return /^\d+$/.test(x);
}

function versionCompare(v1: string, v2: string) {
  const v1parts = v1.split("."),
    v2parts = v2.split(".");

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    throw new Error("Invalid version format");
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (v2parts.length == i) {
      return 1;
    }

    if (v1parts[i] == v2parts[i]) {
      continue;
    } else if (v1parts[i] > v2parts[i]) {
      return 1;
    } else {
      return -1;
    }
  }

  if (v1parts.length != v2parts.length) {
    return -1;
  }

  return 0;
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
      throw new Error(
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

function isUndefinedOrEmptyString(value: unknown): boolean {
  if (value === undefined || value === "") {
    return true;
  }
  return false;
}

function convertDbQuery(params: Query<BasicRecord>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [queryKey, queryVal] of Object.entries(params)) {
    if (isUndefinedOrEmptyString(queryVal)) continue;
    if (typeof queryVal === "boolean") {
      result[queryKey] = queryVal ? "1" : "0";
      continue;
    }
    result[queryKey] = queryVal;
  }
  return result;
}

export {
  getUnMigrationSqls,
  versionCompare,
  convertDbQuery,
  resolveTagsFromDb,
  isUndefinedOrEmptyString as isNilOrEmptyString,
  TagDataType,
};
