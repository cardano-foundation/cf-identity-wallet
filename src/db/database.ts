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
        if (!this.db) return;
        const table = `${tableName}:`;
        const all = await this.db.allDocs({
            include_docs: true,
            startkey: table,
            endkey: `${tableName}\uffff`
        });
        const ll = await this.IDs();
        console.log("ll");
        console.log(ll);
        console.log("all");
        console.log(all);
        return all.rows;
    },
    async IDs() {
        if (!this.db) return;
        const all = await this.db.allDocs();
        return all.rows.map((d: { id: string; }) => d.id);
    },
    async getIDs(tableName:string) {
        if (!this.db) return;
        const table = `${tableName}:`;
        const all = await this.db.allDocs({
            include_docs: true,
            startkey: table,
            endkey: `${tableName}:\uffff`
        });
        return all.rows.map((d: { id: string; }) => d.id.replace(table,''));
    },
    async get(tableName:string, id:string) {
        if (!this.db) return;
        const ids = await this.getIDs(tableName);
        const result = await this.db.get(`${tableName}:${id}`);
        return result.length ? result[0] : undefined
    },
    async getWithIndex(tableName:string, id:string) {
        if (!this.db) return;
        await this.db.createIndex({
            index: {fields: ['_id']}
        });

        const ids = await this.getIDs(tableName);
        const result = await this.db.find({
            selector: {
                _id: `${tableName}:${id}`
            }
        });
        return result?.docs;
    },
    async getByField(tableName:string, field:string, value:string) {
        if (!this.db) return;
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
        if (!this.db) return;

        console.log("id in set");
        console.log(id);
        console.log(tableName);
        this.db.put({
            _id:  `${tableName}:${id}`,
            ...obj
        }).then(function () {
            // success
        }).catch((err: { name: string; status: number; }) => {
            if (err.name === 'conflict' && err.status === 409) {
                this.update(tableName, id, obj)
            } else {
                // some other error
            }
        });
    },
    async update(tableName:string, id:string, obj:any) {
        if (!this.db) return;
        const docToUpdate = await this.db.get(`${tableName}:${id}`);
        this.db.put({
            _id: `${tableName}:${id}`,
            _rev: docToUpdate._rev,
            ...obj
        });
    },
    async remove(tableName:string, id:string) {
        if (!this.db) return;
        const ids = await this.getIDs(tableName);
        const u = await this.getWithIndex(tableName, id);
        //const u2 = await this.get(tableName, id);
        console.log(u);
        //console.log(u2);

        return this.db.remove(`${tableName}:${id}`);
        /*
        this.db.get(`${tableName}:${id}`).then((doc) => {
            console.log("docToRemove");
            console.log(doc);
            return this.db.remove(doc);
        }).then( (result) => {
            console.log("result");
            console.log(result);
            // handle result
        }).catch( (err) => {
            console.log("err");
            console.log(err);
        });
        */
    },
    async clear() {
        if (!this.db) return;
        await this.db.compact();
        await this.db.destroy();
    },
    async close() {
        await this.db.close();
    }
};
