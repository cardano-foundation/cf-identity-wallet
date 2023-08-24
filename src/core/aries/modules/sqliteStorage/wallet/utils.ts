import { MIGRATIONS } from "../migrations";

function getUnMigrationSqls(currentVersion: string): {sqls : string[], latestVersion: string} | null {
  let versionArr: string[] = [];
  MIGRATIONS.forEach((migration) => {
    versionArr.push(migration.version);
  });
  versionArr.sort((a, b) => versionCompare(a, b));
  const latestVersion = versionArr[versionArr.length - 1];
  if (versionCompare(latestVersion, currentVersion) == 0) {
    return null;
  }
  let sqlUnMigrations: string[] = [];
  MIGRATIONS.forEach((migration) => {
    if (versionCompare(currentVersion, migration.version) == -1) {
      sqlUnMigrations.push(...migration.sql);
    }
  });
  return {sqls : sqlUnMigrations, latestVersion};
}

function isValidPart(x: string): boolean {
  return /^\d+$/.test(x);
}

function versionCompare(v1: string, v2: string) {
  let v1parts = v1.split("."),
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


export { getUnMigrationSqls, versionCompare };
