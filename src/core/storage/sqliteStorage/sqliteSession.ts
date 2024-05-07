import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { getUnMigrationSqls } from "./utils";

class SqliteSession {
  static readonly VERSION_DATABASE_KEY = "VERSION_DATABASE_KEY";

  static readonly GET_KV_SQL = "SELECT * FROM kv where key = ?";
  static readonly INSERT_KV_SQL =
    "INSERT OR REPLACE INTO kv (key,value) VALUES (?,?)";

  private sessionInstance?: SQLiteDBConnection;

  get session() {
    return this.sessionInstance;
  }

  private async getKv(key: string): Promise<any> {
    const qValues = await this.sessionInstance?.query(
      SqliteSession.GET_KV_SQL,
      [key]
    );
    if (qValues && qValues.values && qValues.values.length === 1) {
      return JSON.parse(qValues.values[0]?.value);
    }
    return undefined;
  }

  private async getCurrentVersionDatabase(): Promise<string> {
    try {
      const currentVersionDatabase = await this.getKv(
        SqliteSession.VERSION_DATABASE_KEY
      );
      return currentVersionDatabase;
    } catch (error) {
      return "0.0.0";
    }
  }
  async open(storageName: string): Promise<void> {
    const connection = new SQLiteConnection(CapacitorSQLite);
    const ret = await connection.checkConnectionsConsistency();
    const isConn = (await connection.isConnection(storageName, false)).result;
    if (ret.result && isConn) {
      this.sessionInstance = await connection.retrieveConnection(
        storageName,
        false
      );
    } else {
      this.sessionInstance = await connection.createConnection(
        storageName,
        false,
        "no-encryption",
        1,
        false
      );
    }
    await this.sessionInstance.open();
    await this.initDB();
  }

  private async initDB(): Promise<void> {
    const unMigrationSqls = getUnMigrationSqls(
      await this.getCurrentVersionDatabase()
    );
    if (unMigrationSqls) {
      const migrationStatements: { statement: string; values?: string[] }[] =
        unMigrationSqls.sqls.map((sql) => {
          return { statement: sql };
        });
      migrationStatements.push({
        statement: SqliteSession.INSERT_KV_SQL,
        values: [
          SqliteSession.VERSION_DATABASE_KEY,
          JSON.stringify(unMigrationSqls.latestVersion),
        ],
      });
      await this.session?.executeTransaction(migrationStatements);
    }
  }
}

export { SqliteSession };
