import {Database} from '../../db/database';

describe('Database: Set Operation', () => {
  let pouchAPI: Database;

  beforeAll(() => pouchAPI = new Database('db-test', true));

  test('Insert doc successfully', async () => {
    const result = await pouchAPI
      .set('test-table', 'unit-test-1', {data: 'this is a unit test'});
    expect(result.success).toEqual(true);
  });

  test('Insert doc with null or undefined table name failed', async () => {
      const result = await pouchAPI
      .set(null, 'unit-test-1', {data: 'this is a unit test'});
      expect(result.success).toEqual(false);
  });

  test('Insert doc with empty table name failed', async () => {
      const result = await pouchAPI
      .set('', 'unit-test-1', {data: 'this is a unit test'});
      expect(result.success).toEqual(false);
  });

  test('Insert doc with null or undefined id failed', async () => {
      const result = await pouchAPI
      .set('test-table', null, {data: 'this is a unit test'});
      expect(result.success).toEqual(false);
  });

  test('Insert doc with empty id failed',async () => {
      const result = await pouchAPI
      .set('test-table', '', {data: 'this is a unit test'});
      expect(result.success).toEqual(false);
  });

  test('Insert null doc failed', async () => {
      const result = await pouchAPI
      .set('test-table', 'unit-test-1', null);
      expect(result.success).toEqual(false);
  });

  test('Insert undefined doc failed', async () => {
      const result = await pouchAPI
        .set('test-table', 'unit-test-1', undefined);
      expect(result.success).toEqual(false);
  });

  test('Insert empty doc failed', async () => {
      const result = await pouchAPI
      .set('test-table', 'unit-test-1', {});
      expect(result.success).toEqual(false);
  });

  afterAll(() => pouchAPI.close());

});

describe('Database: Get Operation', () => {
    let pouchAPI: Database;

    beforeAll( async () => {
        pouchAPI = new Database('db-test', true);

        await pouchAPI
            .set('test-table', 'unit-test-2', {field: 'this is a unit test'});
    });

    test('Get doc successfully', async () => {
        const result = await pouchAPI
            .get('test-table', 'unit-test-2');

        expect(result.data.field).toEqual('this is a unit test');
    });

    test('Get doc with null table name failed', async () => {
        const result = await pouchAPI
            .get(null, 'unit-test-2');
        expect(result.success).toEqual(false);
    });

    test('Get doc with undefined table name failed', async () => {
        const result = await pouchAPI
            .get(undefined, 'unit-test-2');
        expect(result.success).toEqual(false);
    });

    test('Get doc with null id failed', async () => {

        const result = await pouchAPI
            .get('test-table', null);
        expect(result.success).toEqual(false);
    });

    test('Get doc with undefined id failed', async () => {

        const result = await pouchAPI
            .get('test-table', undefined);
        expect(result.success).toEqual(false);
    });

    afterAll(() => pouchAPI.close());
});
