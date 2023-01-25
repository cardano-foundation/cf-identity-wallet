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
	let all = (await get(key)) || [];
	all = all.filter((a: {id: string}) => a.id !== id);
	await set(key, all);
};

export const getObject = async (key: string, id: string) => {
	try {
		const objs = (await get(key)) || {};
		return objs[id];
	} catch (e) {
		console.log(e);
	}
};
