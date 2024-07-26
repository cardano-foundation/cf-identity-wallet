const DATA_V002 = {
  version: "0.0.2",
  sql: [
    `UPDATE items SET id = REPLACE(id, 'metadata:', '');
    UPDATE items SET name = REPLACE(name, 'metadata:', '');
    UPDATE items
      SET value = json_set(
          value,
          '$.id',
          replace(json_extract(value, '$.id'), 'metadata:', '')
      )
      WHERE json_extract(value, '$.id') LIKE 'metadata:%';
    UPDATE items
      SET value = json_set(
          value,
          '$._tags.id',
          replace(json_extract(value, '$._tags.id'), 'metadata:', '')
      )
      WHERE json_extract(value, '$._tags.id') LIKE 'metadata:%';
    UPDATE items_tags SET item_id = REPLACE(item_id, 'metadata:', '');
    UPDATE items_tags SET value = REPLACE(value, 'metadata:', '');
    `,
  ],
};
export { DATA_V002 };
