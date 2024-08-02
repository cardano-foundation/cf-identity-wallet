import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import { DATA_V001 } from "./v0.0.1-init_sql";
import { DATA_V002 } from "./v0.0.2-credentialPrefix";

export const MIGRATIONS: {
  version: string;
  sql?: string[];
  migrationStatements?: (session?: SQLiteDBConnection) => Promise<
    {
      statement: string;
      values?: unknown[];
    }[]
  >;
}[] = [DATA_V001, DATA_V002];
