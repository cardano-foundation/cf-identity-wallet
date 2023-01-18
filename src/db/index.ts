import {createStore, get, getObject, set, setObject} from './storage';
import {
	BLOCKFROST_DEFAULT_URL,
	BLOCKFROST_TOKEN,
	DEFAULT_NETWORK,
	SUBMIT_DEFAULT_URL,
} from '../../config';
import {maxId} from '../utils/utils';

export const DB_NAME = 'WALLET_DB';

createStore(DB_NAME);

export const initDb = async () => {
	await createStore(DB_NAME);
};

export const getAccountsFromDb = async () => {
	return await get('accounts');
};

export const getAccountFromDb = async (name?: string) => {
	const accounts = (await get('accounts')) || [];
	if (accounts && Object.keys(accounts).length && !name) {
		return accounts[Object.keys(accounts)[0]];
	}
	const settings = await getSettingsFromDb();
	const currentName = name ? name : settings && settings.currentAccount;

	if (accounts) {
		// @ts-ignore
		return accounts[currentName];
	}
};
export const removeAccountFromDb = async (name: string) => {
	const accounts = await get('accounts');
	if (accounts[name] !== undefined) {
		delete accounts[name];
		await set('accounts', accounts);
	}
};

export const getSettingsFromDb = async () => {
	const settings = await get('settings');

	if (settings) {
		return settings;
	} else {
		const defaultSettings = {
			language: 'English',
			currentAccount: undefined,
			enableNotifications: false,
			darkTheme: false,
			network: {
				blockfrost: {
					url: BLOCKFROST_DEFAULT_URL,
					token: BLOCKFROST_TOKEN
				},
				net: 'preprod',
				submit: SUBMIT_DEFAULT_URL
			},
		};
		await set('settings', defaultSettings);
		return defaultSettings;
	}
};

export const setSettingsInDb = async (settings: any) => {
	if (settings) {
		await set('settings', settings);
	}
};

export const updateAccountByNetworkInDb = async (
	network: string,
	account: any
) => {
	if (account) {
		const acc = await getAccountFromDb();
		if (!acc) return;
		acc[network] = account;
		await setObject('accounts', acc.name, acc);
	}
};
export const updateAccountByNameAndNetworkInDb = async (
	network: string,
	name: string,
	account: any
) => {
	if (account) {
		const acc = await getAccountFromDb(name);
		if (!acc) return;
		acc[network] = account;
		await setObject('accounts', acc.name, acc);
	}
};

export const setAccountInDb = async (account: any) => {
	await setObject('accounts', account.name, account);
	return account.name;
};

export const setSelectedAddressInDb = async (address: string) => {
	if (address) {
		const acc = await getAccountFromDb();
		if (!acc) return;
		acc.selectedAddress = address;
		await setObject('accounts', acc.name, acc);
	}
};

export const getNetworkFromDb = async () => {
	const settings = await get('settings');

	if (settings && settings.network) {
		return settings.network;
	} else {
		return {
			blockfrost: {
				url: BLOCKFROST_DEFAULT_URL,
				token: BLOCKFROST_TOKEN,
			},
			net: DEFAULT_NETWORK,
			submit: SUBMIT_DEFAULT_URL,
		};
	}
};
export const setCurrentAccountInDb = async (id: string) => {
	const settings = await get('settings');

	if (settings) {
		settings.currentAccount = id;
		await set('settings', settings);
	}
};

export const setBlockfrostInDb = async (url: string, token: string) => {
	const settings = await get('settings');

	if (settings) {
		settings.network.blockfrost = {
			...settings.network.blockfrost,
			url,
			token,
		};
		await set('settings', settings);
	}
};

export const setNetworkInDb = async (net: string) => {
	const settings = await get('settings');

	if (settings) {
		settings.network = {
			...settings.network,
			net,
		};
		await set('settings', settings);
	}
};
export const setSubmitUrlInDb = async (submitUrl: string) => {
	const settings = await get('settings');

	if (settings) {
		settings.network = {
			...settings.network,
			submit: submitUrl,
		};
		await set('settings', settings);
	}
};

export const setExternalInDb = async (external: any) => {
	await set('external', external);
};

export const getExternalInDb = async () => {
	const external = await get('external');
	if (external && external.whitelist) {
		return external;
	} else {
		return {
			whitelist: [window.origin],
		};
	}
};

export const getWhitelistInDb = async () => {
	const external = await get('external');
	return external?.whitelist || [];
};

export const addOriginToWhitelist = async (origin: string) => {
	const external = (await get('external')) || [];

	if (external && external.whitelist && !external.whitelist.includes(origin)) {
		external.whitelist = [...external.whitelist, origin];
		await set('external', external);
	}
};

export const removeOriginFromWhitelist = async (origin: string) => {
	const external = await get('external');
	if (external && external.whitelist.includes(origin)) {
		external.whitelist = external.whitelist.filter(
			(ori: string) => ori !== origin
		);
		await set('external', external);
	}
};
