import {Database} from '../../db/database';

describe('Database Unit Testing', () => {
  let pouchAPI: Database;

  beforeAll(() => pouchAPI = new Database('db-test', true));

  test('Insert doc successfully', () => {
    pouchAPI
      .set('test-table', 'unit-test-1', {data: 'this is a unit test'})
      .then((result) => {
        expect(result).toEqual({success: true});
      });
  });

  afterAll(() => pouchAPI.close());

});
