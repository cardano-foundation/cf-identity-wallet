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

export const setObject = async (key: string, id: string, val: any) => {
	try {
		const objs = (await get(key)) || {};
		objs[id] = val;
		await set(key, objs);
		return true;
	} catch (e) {
		return false;
	}
};

export const setNewObject = async (key: string, val: any) => {
	try {
		const value = {...val};

		let all = await storage.get(key);
		let objIndex = 0;
		let aux = 0;

		if (all) {
			objIndex = maxId(all);
			if (objIndex >= 0) aux += 1;
			else objIndex = 0;

			value['id'] = objIndex + aux;
			all[objIndex + aux] = value;
		} else {
			value['id'] = 0;
			objIndex = 0;
			all = Array(1).fill(value);
		}

		await set(key, all);
		return objIndex + aux;
	} catch (e) {
		console.log('error');
		console.log(e);
		return -1;
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
