import {Storage, Drivers} from '@ionic/storage';

export const PreferencesAPI = {
    dbName: '',
    storage: undefined as undefined | typeof Storage,
    async init(dbName:any = 'preferences') {
        this.dbName = dbName;
        // @ts-ignore
        this.storage = await createStore(this.table);
    },
    async set(table:string, obj:any) {
        if (obj && Object.keys(obj)?.length) {
            // @ts-ignore
            await this.storage.set(table, obj);
        }
    },
    async get(table:string) {
        // @ts-ignore
        return this.storage.get(table);
    }
}

export const createStore = (name = 'defaultDb') => {
    const storage = new Storage({
        name,
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    });
    storage.create();
    return storage;
};
