import { Database } from "../../db/database";

describe("PouchDb Unit Testing", () => {

   const pouchAPI: Database = new Database('db-test', true);

   test("Insert doc successfully", () => {
      pouchAPI.set("test-table", "unit-test-1", {data: "this is a unit test"}).then(result => {
         expect(result).toEqual({success: true});
      });
   });
});
