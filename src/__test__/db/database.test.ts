import {Database} from '../../db/database';

describe('Database Unit Testing', () => {
  let pouchAPI: Database;

  beforeAll(() => pouchAPI = new Database('db-test', true));

  test('Insert doc successfully', () => {
    pouchAPI
      .set('test-table', 'unit-test-1', {data: 'this is a unit test'})
      .then((result) => {
        expect(result.success).toEqual(true);
      });
  });

  test('Insert doc with null or undefined table name failed', () => {
    pouchAPI
      .set(null, 'unit-test-1', {data: 'this is a unit test'})
      .then((result) => {
        expect(result.success).toEqual(false);
      });
  });
  
  test('Insert doc with empty table name failed', () => {
    pouchAPI
      .set('', 'unit-test-1', {data: 'this is a unit test'})
      .then((result) => {
        expect(result.success).toEqual(false);
      });
  });

  test('Insert doc with null or undefined id failed', () => {
    pouchAPI
      .set('test-table', null, {data: 'this is a unit test'})
      .then((result) => {
        expect(result.success).toEqual(false);
      });
  });
  
  test('Insert doc with empty id failed', () => {
    pouchAPI
      .set('test-table', '', {data: 'this is a unit test'})
      .then((result) => {
        expect(result.success).toEqual(false);
      });
  });

  test('Insert null doc failed', () => {
    pouchAPI
      .set('test-table', 'unit-test-1', null)
      .then((result) => {
        expect(result.success).toEqual(false);
      });
  });

  test('Insert undefined doc failed', () => {
    pouchAPI
        .set('test-table', 'unit-test-1', undefined)
        .then((result) => {
          expect(result.success).toEqual(false);
        });
  });
  
  test('Insert empty doc failed', () => {
    pouchAPI
      .set('test-table', 'unit-test-1', {})
      .then((result) => {
        expect(result.success).toEqual(false);
      });
  });

  afterAll(() => pouchAPI.close());

});
