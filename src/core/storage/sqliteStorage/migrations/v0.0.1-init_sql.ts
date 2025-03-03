import { MigrationType, SqlMigration } from "./migrations.types";

const DATA_V001: SqlMigration = {
  type: MigrationType.SQL,
  version: "0.0.1",
  sql: [
    "CREATE TABLE IF NOT EXISTS kv (key text unique, value text)",
    `CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            value TEXT NOT NULL
        );`,
    `CREATE TABLE IF NOT EXISTS items_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT NOT NULL,
            name TEXT NOT NULL,
            value TEXT NOT NULL,
            type TEXT NOT NULL,
            FOREIGN KEY (item_id) REFERENCES items (id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );`,
    "CREATE INDEX IF NOT EXISTS ix_items_tags_item_id ON items_tags (item_id);",
    "CREATE INDEX IF NOT EXISTS ix_items_tags_name ON items_tags (name, value);",
  ],
};

export { DATA_V001 };
