const DATA_V002 = {
  version: "0.0.2",
  sql: [
    `UPDATE items SET id = REPLACE(id, 'metadata:', '');
     UPDATE items SET name = REPLACE(name, 'metadata:', '');`,
  ],
};
export { DATA_V002 };
