import {
  createPluggableStorage,
  PluggableStorage,
} from '../../db/PluggableStorage';

describe('Database: Set Operation', () => {
  let databaseAPI: PluggableStorage;

  beforeAll(
    () =>
      (databaseAPI = createPluggableStorage({
        name: 'test-db',
        type: 'pouchdb',
        inMemory: true,
      }))
  );

  test('Insert doc successfully', async () => {
    const result = await databaseAPI.set('test-table', 'unit-test-1', {
      data: 'this is a unit test',
    });
    expect(result.success).toEqual(true);
  });

  test('Insert doc with null table name failed', async () => {
    const result = await databaseAPI.set(null, 'unit-test-1', {
      data: 'this is a unit test',
    });
    expect(result.success).toEqual(false);
  });

  test('Insert doc with empty table name failed', async () => {
    const result = await databaseAPI.set('', 'unit-test-1', {
      data: 'this is a unit test',
    });
    expect(result.success).toEqual(false);
  });

  test('Insert doc with null id failed', async () => {
    const result = await databaseAPI.set('test-table', null, {
      data: 'this is a unit test',
    });
    expect(result.success).toEqual(false);
  });

  test('Insert doc with empty id failed', async () => {
    const result = await databaseAPI.set('test-table', '', {
      data: 'this is a unit test',
    });
    expect(result.success).toEqual(false);
  });

  test('Insert null doc failed', async () => {
    const result = await databaseAPI.set('test-table', 'unit-test-1', null);
    expect(result.success).toEqual(false);
  });

  test('Insert undefined doc failed', async () => {
    const result = await databaseAPI.set(
      'test-table',
      'unit-test-1',
      undefined
    );
    expect(result.success).toEqual(false);
  });

  test('Insert empty doc failed', async () => {
    const result = await databaseAPI.set('test-table', 'unit-test-1', {});
    expect(result.success).toEqual(false);
  });

  afterAll(() => databaseAPI.close());
});

describe('Database: Get Operation', () => {
  let databaseAPI: PluggableStorage;

  beforeAll(async () => {
    databaseAPI = createPluggableStorage({
      name: 'test-db',
      type: 'pouchdb',
      inMemory: true,
    });

    await databaseAPI.set('test-table', 'unit-test-2', {
      field: 'this is a unit test',
    });
  });

  test('Get doc successfully', async () => {
    const result = await databaseAPI.get('test-table', 'unit-test-2');

    expect(result.data.field).toEqual('this is a unit test');
  });

  test('Get doc with null table name failed', async () => {
    const result = await databaseAPI.get(null, 'unit-test-2');
    expect(result.success).toEqual(false);
  });

  test('Get doc with undefined table name failed', async () => {
    const result = await databaseAPI.get(undefined, 'unit-test-2');
    expect(result.success).toEqual(false);
  });

  test('Get doc with null id failed', async () => {
    const result = await databaseAPI.get('test-table', null);
    expect(result.success).toEqual(false);
  });

  test('Get doc with undefined id failed', async () => {
    const result = await databaseAPI.get('test-table', undefined);
    expect(result.success).toEqual(false);
  });

  afterAll(() => databaseAPI.close());
});
