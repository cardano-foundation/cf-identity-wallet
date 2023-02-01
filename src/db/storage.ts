import {Storage, Drivers} from '@ionic/storage';
import {maxId} from '../utils/utils';

let storage: Storage = new Storage();

export const createStore = (name = 'walletStorage') => {
  storage = new Storage({
    name,
    driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
  });

  storage.create();
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

export const setObject = async (table: string, id: string, val: any) => {
  try {
    const objs = (await get(table)) || {};
    objs[id] = val;
    await set(table, objs);
    return true;
  } catch (e) {
    return false;
  }
};

export const removeObject = async (key: string, id: string) => {
  let objs = await get(key);
  if (!objs) return;

  const filtered = Object.keys(objs)
    .filter((objId) => objId !== id)
    .reduce((obj, key) => {
      // @ts-ignore
      obj[key] = objs[key];
      return obj;
    }, {});

  await set(key, filtered);
};

export const getObject = async (key: string, id: string) => {
  try {
    const objs = (await get(key)) || {};
    return objs[id];
  } catch (e) {
    console.log(e);
  }
};
