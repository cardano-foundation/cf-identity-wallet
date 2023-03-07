import { Database } from "../../db/database";

describe("PouchDb Unit Testing", () => {

   const pouchAPI: Database = new Database('db-test', true);

   test("Insert doc", () => {
      expect(0).toEqual(0);
   });
});
