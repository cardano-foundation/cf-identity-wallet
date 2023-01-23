import {sha256} from 'crypto-hash';

export function addressSlice(address: string, sliceLength = 10) {
	if (address) {
		return `${address.slice(0, sliceLength)}...${address.slice(-sliceLength)}`;
	}
	return address;
}

export const addBigNum = (a: string, b: string) => {
	return;
};

export const getKeyByValue = (object: any, value: string) => {
	return Object.keys(object).find((key) => object[key] === value);
};

export const maxId = (arr: any[]) => {
	if (arr.length === 0) {
		return -1;
	}

	let max = arr[0].id;

	for (let i = 0; i < arr.length; i++) {
		if (arr[i].id > max) {
			max = arr[i].id;
		}
	}

	return max;
};

export const compareObjectsByHash = async (obj1: any, obj2: any) => {
	try {
		const hash1 = await sha256(JSON.stringify(obj1));
		const hash2 = await sha256(JSON.stringify(obj2));

		return hash1 === hash2;
	} catch (e) {
		return false;
	}
};

export function amountIsValid(amount: string) {
	return true;
	//return /(?<=^| )\d+(\.\d+)?(?=$| )/.test(amount); TODO: not working with excode: SyntaxError: Invalid regular expression: invalid group specifier name
}

export const fromBytes = (bytes: Uint8Array) =>
	Buffer.from(bytes).toString('hex');

export const fromUTF8 = (utf8: string) => {
	if (utf8.length % 2 === 0 && /^[0-9A-F]*$/i.test(utf8)) return utf8;

	return fromBytes(Buffer.from(utf8, 'utf-8'));
};

export const capitalizeFirstLetter = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const isJsonString = (str: string) => {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};
