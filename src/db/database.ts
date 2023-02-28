// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import find from 'pouchdb-find';
PouchDB.plugin(find);
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));

export const PouchAPI = {
  databaseName: 'database-dev',
  db: undefined as undefined | typeof PouchDB,
  async init(databaseName?: string) {
    try {
      this.databaseName = databaseName || 'database-dev';
      this.db = await new PouchDB(`${databaseName}.db`, {
        adapter: 'cordova-sqlite',
      });
      console.log('[INFO] Init PouchAPI');
    } catch (error) {
      console.log('[ERROR] Init PouchAPI');
    }
  },
  async getTable(tableName: string) {
    if (!this.db) return;
    const table = `${tableName}:`;
    const all = await this.db.allDocs({
      include_docs: true,
      startkey: table,
      endkey: `${tableName}\uffff`,
    });
    return all.rows;
  },
  async IDs() {
    if (!this.db) return;
    const all = await this.db.allDocs();
    return all.rows.map((d: {id: string}) => d.id);
  },
  async getIDs(tableName: string) {
    if (!this.db) return;
    const table = `${tableName}:`;
    const all = await this.getTable(table);
    return all.map((d: {id: string}) => d.id.replace(table, ''));
  },
  async get(tableName: string, id: string) {
    if (!this.db) return;
    return this.db
      .get(`${tableName}:${id}`)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        if (error.name === 'not_found' && error.status === 404) {
          return undefined;
        }
        return error;
      });
  },
  async getByField(tableName: string, field: string, value: string) {
    if (!this.db) return;
    await this.db.createIndex({
      index: {fields: [field]},
    });
    const selector: {[key: string]: string} = {};
    selector[field] = value;
    return await this.db.find({
      selector,
    });
  },
  async set(tableName: string, id: string, obj: any) {
    if (!this.db) return;

    await this.db
      .put({
        _id: `${tableName}:${id}`,
        ...obj,
      })
      .catch(async (error) => {
        if (error.name === 'conflict' && error.status === 409) {
          await this.update(tableName, id, obj);
        }
      });
  },
  async update(tableName: string, id: string, obj: any) {
    if (!this.db) return;
    const docToUpdate = await this.get(tableName, id);

    await this.db
      .put({
        _id: `${tableName}:${id}`,
        _rev: docToUpdate._rev,
        ...obj,
      })
      .catch((error) => {
        //console.log("error434w:",error)
      });
  },
  async remove(tableName: string, id: string) {
    if (!this.db) return;
    this.db
      .get(`${tableName}:${id}`)
      .then((doc) => {
        this.db.remove(doc);
      })
      .catch((error) => {
        if (error.name === 'not_found' && error.status === 404) {
          // handle error
        }
      });
  },
  async clear() {
    if (!this.db) return;
    try {
      await this.db.compact();
      await this.db.destroy();
    } catch (e) {
      // handle error
      return e;
    }
  },
  async close() {
    await this.db.close();
  },
};
