import {Storage, Drivers} from '@ionic/storage';


export const PreferencesAPI = {
    table: 'settings',
    storage: undefined as undefined | typeof Storage,
    async init(settings:any = null) {
        // @ts-ignore
        this.storage = await createStore(`${this.table}.preferences`);
        await this.set(settings);
    },
    async set(settings:any) {
        if (settings && Object.keys(settings)?.length) {
            // @ts-ignore
            await this.storage.set(this.table,settings);
        }
    },

}

export const createStore = (name = 'preferences') => {
    const storage = new Storage({
        name,
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    });

    storage.create();

    return storage;
};

export const set = async (key: string, val: any) => {
    await storage.set(key, val);
};

export const get = async (key: string) => {
    return await storage.get(key);
};

export const keys = async () => {
    return await storage.keys();
};

export const remove = async (key: string) => {
    await storage.remove(key);
};

export const clear = async () => {
    await storage.clear();
};
