// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import find from "pouchdb-find";
PouchDB.plugin(find)
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));

export const PouchAPI = {
    databaseName: '',
    db: undefined as undefined | typeof PouchDB,
    init(databaseName:string) {
        this.databaseName = databaseName;
        this.db = new PouchDB(`${databaseName}.db`, {adapter: 'cordova-sqlite'});
    },
    async getTable(tableName:string) {
        const table = `${tableName}:`;
        const all = await this.db.allDocs({
            include_docs: true,
            startkey: table,
            endkey: `${tableName}:\uffff`
        });
        return all.rows;
    },
    async allIds(tableName:string) {
        const table = `${tableName}:`;
        const all = await this.db.allDocs({
            include_docs: true,
            startkey: table,
            endkey: `${tableName}:\uffff`
        });
        return all.rows.map(d => d.id.replace(table,''));
    },
    async get(tableName:string, id:string) {
        await this.db.createIndex({
            index: {fields: ['_id']}
        });
        return await this.db.find({
            selector: {
                _id: `${tableName}:${id}`
            }
        });
    },
    async getByField(tableName:string, field:string, value:string) {
        await this.db.createIndex({
            index: {fields: [field]}
        });
        const selector:{[key:string]:string} = {};
        selector[field] = value;
        return await this.db.find({
            selector
        });
    },
    async set(tableName:string, id:string, obj:any) {
        await this.db.put({
            _id:  `${tableName}:${id}`,
            ...obj
        });
    },
    async update(tableName:string, id:string, obj:any) {
        const docToUpdate = await this.db.get(`${tableName}:${id}`);
        this.db.put({
            _id: `${tableName}:${id}`,
            _rev: docToUpdate._rev,
            ...obj
        });
    },
    async remove(tableName:string, id:string) {
        const docToRemove = await this.db.get(`${tableName}:${id}`);
        await this.db.remove(docToRemove);
    },
    async close() {
        await this.db.close();
    }
};