const MIGRATION_SQL = [
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
          FOREIGN KEY (item_id) REFERENCES items (id)
              ON DELETE CASCADE ON UPDATE CASCADE
      );`,
  `CREATE INDEX ix_items_tags_item_id ON items_tags (item_id);`,
  `CREATE INDEX ix_items_tags_name ON items_tags (name, value);`,
];
export { MIGRATION_SQL };
