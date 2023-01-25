import {ERA, IAccount, IAddress, IAsset, ICertificate, INetwork, ITransaction, IUtxo, TX_STATUS,} from '../types';
import {get, getObject, keys, remove, removeObject, setObject} from '../../db/storage';
import {Capacitor} from "@capacitor/core";
import {getKeystore, setKeystore} from "../../db/keystore";

export class Account implements IAccount {
	private static table: string;
	table = 'account';
	private id: string | undefined;
	private name: string | undefined;
	private encryptedRootKey: string | undefined;
	private certificates: {
		[key: string]:
			ICertificate
	};
	private networks: {
		[key: string]: INetwork;
	};
	era: ERA | undefined;
	rootPublicKeyHex: string | undefined;

	constructor() {
		this.id = undefined;
		this.name = undefined;
		this.era = undefined;
		this.encryptedRootKey = undefined;
		this.rootPublicKeyHex = undefined;
		this.networks = {};
		this.certificates = {};
	}

	balance(network: string) {
		return this.networks[network]?.assets['lovelace'];
	}

	set(account: IAccount) {
		this.era = account.era;
		this.rootPublicKeyHex = account.rootPublicKeyHex;
	}

	setEncryptedRootKey(encryptedRootKey: string) {
		if (Capacitor.getPlatform() !== 'web'){
			setKeystore(`${this.id}:rootKey`, encryptedRootKey)
		} else {
			// web, extension and desktop
			this.encryptedRootKey = encryptedRootKey;
		}
	}

	async getEncryptedRootKey() {
		return await this.getCertificate(`${this.id}:rootKey`);
	}

	setCertificate(name: string, certificate: ICertificate) {
		if (Capacitor.getPlatform() !== 'web'){
			setKeystore(`${this.id}:certificate`, JSON.stringify(certificate))
		} else {
			// web, extension and desktop
			this.certificates[name] = certificate;
		}
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

	setNetworks(networkName: string, networkObj: {[key: string]: INetwork}) {
		this.networks = networkObj
	}

	setNetwork(networkName: string, networkObj: INetwork) {
		this.networks[networkName] = networkObj
	}

	getName() {
		return this.name;
	}

	async setName(name: string) {

		// check if is unique
		const accountNames = await Account.getAllAccountIds();
		if (accountNames && accountNames.includes(name)){
			return {
				error: "Name already exists"
			}
		}
		this.name = name;
		this.id = name;
	}

	getNetwork(networkName: string) {
		return this.networks[networkName];
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

	static async getAccount(id:string) {
		return  await getObject(this.table, id)
	}

	static async getAllAccountIds() {
		const allKeys = await get(this.table);
		if (!allKeys) return;
		return Object.keys(allKeys);
	}
}
