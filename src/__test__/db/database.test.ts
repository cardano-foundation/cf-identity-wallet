import { Database } from "../../db/database";

describe("Database - PouchDb", () => {

   const pouchAPI: Database = new Database('db-test', true);

   test("Unit Test 1", () => {
      expect(0).toEqual(0);
   });
});
