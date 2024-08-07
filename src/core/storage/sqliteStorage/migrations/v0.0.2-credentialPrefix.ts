import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { SqliteStorage } from "..";
import { resolveTagsFromDb } from "../utils";
import { StorageRecord } from "../../storage.types";
import { CredentialMetadataRecord } from "../../../agent/records";
import { deserializeRecord } from "../../utils";

export const DATA_V002 = {
  version: "0.0.2",
  migrationStatements: (session: SQLiteDBConnection) =>
    credentialStatements(session),
};

async function credentialStatements(session?: SQLiteDBConnection) {
  const qValues = await session?.query(SqliteStorage.SCAN_QUERY_SQL, [
    CredentialMetadataRecord.type,
  ]);

  let allCredentials: StorageRecord[] = [];

  if (qValues && qValues.values && qValues.values.length > 0) {
    allCredentials = qValues.values.map((record) => {
      return {
        ...record,
        tags: resolveTagsFromDb(record.tags),
      } as StorageRecord;
    });
  }

  const migrationStatements: { statement: string; values?: unknown[] }[] = [];
  for (const credentialRecord of allCredentials) {
    const instance = deserializeRecord(
      credentialRecord,
      CredentialMetadataRecord
    );
    const statement = await updateCredentialPrefix({
      ...credentialRecord,
      id: instance.id,
    });
    migrationStatements.push(...statement);
  }

  return migrationStatements;
}

async function updateCredentialPrefix(
  credentialRecord: StorageRecord & { id: string }
): Promise<{ statement: string; values?: unknown[] }[]> {
  const newId = credentialRecord.id.replace("metadata:", "");
  const tagId = credentialRecord.tags.id as string;

  const newTag = {
    ...credentialRecord.tags,
    id: tagId.replace("metadata:", ""),
  };
  const valueObj = JSON.parse(credentialRecord.value);
  const newValue = {
    ...valueObj,
    id: valueObj.id.replace("metadata:", ""),
    _tags: {
      ...valueObj._tags,
      id: valueObj._tags.id.replace("metadata:", ""),
    },
  };
  const newName = credentialRecord.name.replace("metadata:", "");

  const transactionStatements: { statement: string; values?: unknown[] }[] = [];

  transactionStatements.push({
    statement:
      "UPDATE items set category = ?, name = ?, value = ?, id = ? where id = ?",
    values: [
      credentialRecord.category,
      newName,
      JSON.stringify(newValue),
      newId,
      credentialRecord.id,
    ],
  });

  transactionStatements.push(
    ...new SqliteStorage().getTagsInsertSql(newId, newTag)
  );

  return transactionStatements;
}
