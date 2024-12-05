import { open, RootDatabase } from "lmdb";

class Lmdb {
  private static instance: Lmdb;
  private db: RootDatabase;

  private constructor() {
    this.db = open({
      path: "./data/lmdb",
    });
  }

  public static getInstance(): Lmdb {
    if (!Lmdb.instance) {
      Lmdb.instance = new Lmdb();
    }
    return Lmdb.instance;
  }

  public async put(key: string, value: any): Promise<void> {
    try {
      await this.db.put(key, value);
    } catch (error) {
      console.error("Error putting data in LMDB:", error);
      throw error;
    }
  }

  public get(key: string): any {
    try {
      return this.db.get(key);
    } catch (error) {
      console.error("Error getting data from LMDB:", error);
      throw error;
    }
  }
}

export default Lmdb.getInstance();
