import {ERA, IAccount, IAddress, IAsset, ICertificate, ITransaction, IUtxo, TX_STATUS,} from '../types';
import {get, keys, remove, removeObject, setObject} from '../../db/storage';
import {Capacitor} from "@capacitor/core";
import {getKeystore, setKeystore} from "../../db/keystore";

export class Account implements IAccount {
	private static table: string;
	table = 'account';
	id: string | undefined;
	name: string | undefined;
	era: ERA | undefined;
	private encryptedRootKey: string | undefined;
	certificates: {[key: string]: ICertificate};
	networks: {
		[key: string]: {
			assets: {[unit: string]: IAsset},
			utxos: IUtxo[],
			collateral: string[],
			vault: string[],
			addresses: IAddress[],
			transactions: ITransaction[]
		};
	};

	constructor() {
		this.id = undefined;
		this.name = undefined;
		this.era = undefined;
		this.encryptedRootKey = undefined;
		this.networks = {};
		this.certificates = {};
	}

	balance(network: string) {
		return this.networks[network]?.assets['lovelace'];
	}

	set(account: IAccount) {
		this.id = account.id;
		this.name = account.name;
		this.era = account.era;
		this.certificates = account.certificates;
		this.networks = account.networks;
	}

	setEncryptedRootKey(encryptedRootKey: string) {
		if (Capacitor.getPlatform() !== 'web'){
			setKeystore(`${this.id}:rootKey`, encryptedRootKey)
		} else {
			// web, extension and desktop
			this.encryptedRootKey = encryptedRootKey;
		}
	}

	setCertificate(name: string, certificate: ICertificate) {
		if (Capacitor.getPlatform() !== 'web'){
			setKeystore(`${this.id}:certificate`, JSON.stringify(certificate))
		} else {
			// web, extension and desktop
			this.certificates[name] = certificate;
		}
	}

	async getEncryptedRootKey() {
		return await this.getCertificate(`${this.id}:rootKey`);
	}

	async getCertificate(name:string) {
		if (Capacitor.getPlatform() !== 'web'){
			// ios/android keystore
			return await getKeystore(name);
		} else {
			return this.certificates[name];
		}
	}

	setAssets(network: string, assets: {[unit: string]: IAsset}) {
		this.networks[network] = {
			...this.networks[network],
			assets,
		};
	}

	asset(network: string, unit: string) {
		return this.networks[network]?.assets[unit];
	}

	setUtxos(network: string, utxos: IUtxo[]) {
		this.networks[network] = {
			...this.networks[network],
			utxos,
		};
	}

	address(network: string, index: number, chain: number) {
		return this.networks[network].addresses.find(
			(address) => address.index === index && address.chain === chain
		);
	}

	externalAddresses(network: string) {
		return this.networks[network].addresses.filter(
			(address) => address.chain === 0
		);
	}

	internalAddresses(network: string) {
		return this.networks[network].addresses.filter(
			(address) => address.chain === 1
		);
	}

	unusedAddresses(network: string) {
		// check addresses used in history and diff
	}

	pendingTransactions(network: string) {
		return this.networks[network].transactions.filter(
			(tx) => tx.status === TX_STATUS.PENDING
		);
	}

	addTransaction(network: string, tx: ITransaction) {
		if (!this.networks[network]?.transactions?.length) {
			this.networks[network] = {
				...this.networks[network],
				transactions: [],
			};
		}
		const index = this.networks[network].transactions.findIndex(
			(t) => t.txHash === tx.txHash
		);
		this.networks[network].transactions[index <= 0 ? 0 : index] = tx;
	}

	commit() {
		if (!this.id || !this.id.length ) return;
		setObject(this.table, this.id, this.toJson());
	}

	remove() {
		if (!this.id) return;
		removeObject(this.table, this.id);
	}

	toJson() {
		try {
			return JSON.stringify({
				id: this.id,
				name: this.name,
				era: this.era,
				encryptedRootKey: this.encryptedRootKey,
				certificates: this.certificates,
				network: this.networks,
			});
		} catch (e) {
			return {
				error: e,
			};
		}
	}

	static new(acc: IAccount) {
		return (new Account()).set(acc);
	}

	static fromJson(json: string) {
		try {
			const jsonObj = JSON.parse(json);
			return Account.new(jsonObj);
		} catch (e) {
			return {
				error: e,
			};
		}
	}

	static async getAllAccountIds() {
		const allKeys = await get(this.table);
		if (!allKeys) return;
		return Object.keys(allKeys);
	}
}
