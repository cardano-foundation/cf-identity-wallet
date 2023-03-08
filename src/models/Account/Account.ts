import {
  ERA,
  IAccount,
  IAsset,
  ICertificate,
  INetwork,
  ITransaction,
  IUtxo,
  TX_STATUS,
} from '../types';
import {Capacitor} from '@capacitor/core';
import {getKeystore, setKeystore} from '../../db/keystore';
import {pouchAPI} from '../../components/AppWrapper';

const KEY_CHAIN_DEVICES = ['iphone', 'ipad', 'phablet', 'tablet', 'android'];

export class Account {
  static table = 'account';
  private id: string | undefined;
  private name: string | undefined;
  private encryptedRootKey: string | undefined;
  private certificates: {
    [key: string]: ICertificate;
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

  get(): IAccount {
    return JSON.parse(<string>this.toString());
  }

  set(account: any) {
    this.id = account.id;
    this.name = account.name;
    this.era = account.era;
    this.encryptedRootKey = account.encryptedRootKey;
    this.rootPublicKeyHex = account.rootPublicKeyHex;
    this.networks = account.networks;
    this.certificates = account.certificates;
  }

  setEncryptedRootKey(encryptedRootKey: string) {
    if (KEY_CHAIN_DEVICES.includes(Capacitor.getPlatform())) {
      setKeystore(`${this.id}:rootKey`, encryptedRootKey);
    } else {
      // web, extension and desktop
      this.encryptedRootKey = encryptedRootKey;
    }
  }

  async getEncryptedRootKey() {
    return await this.getCertificate(`${this.id}:rootKey`);
  }

  setCertificate(name: string, certificate: ICertificate) {
    if (KEY_CHAIN_DEVICES.includes(Capacitor.getPlatform())) {
      setKeystore(`${this.id}:certificate`, JSON.stringify(certificate));
    } else {
      // web, extension and desktop
      this.certificates[name] = certificate;
    }
  }

  async getCertificate(name: string) {
    if (Capacitor.getPlatform() !== 'web') {
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
    this.networks = networkObj;
  }

  setNetwork(networkName: string, networkObj: INetwork) {
    this.networks[networkName] = networkObj;
  }

  getName() {
    return this.name;
  }

  async setName(name: string) {
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

  async commit() {
    if (!this.id || !this.id.length)
      return {success: false, error: `Invalid id with type: ${typeof this.id}`};

    try {
      await pouchAPI.set(Account.table, this.id, this);
    } catch (e: any) {
      return {
        error: e.error.description,
      };
    }
  }

  async remove() {
    if (!this.id) return;
    await pouchAPI.remove(Account.table, this.id);
  }

  toString() {
    try {
      return JSON.stringify(this);
    } catch (e) {
      return {
        error: e,
      };
    }
  }

  static new(acc: any) {
    const account = new Account();
    account.set(acc);

    return account;
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

  static async getAccount(id: string) {
    const accountDoc = await pouchAPI.get(Account.table, id);
    if (!accountDoc || !accountDoc.data.docs?.length) return;
    const account = accountDoc.data.docs[0];

    return Account.new(account);
  }

  static async accountAlreadyExists(id: string) {
    const account = await this.getAccount(id);
    return account !== undefined;
  }

  static async getFirstAccount() {
    const accounts = await this.getAllAccounts();
    if (!accounts || !Object.entries(accounts).length) return;
    return Account.new(Object.entries(accounts)[0]);
  }

  static async removeAccount(id: string) {
    if (!id) return;
    await pouchAPI.remove(Account.table, id);
  }

  static async getAllAccounts() {
    const accountDocs = await pouchAPI.getTable(Account.table);
    return accountDocs.map((acc: {doc: any}) => acc.doc);
  }

  static async getAllAccountsIds() {
    const accounts = await pouchAPI.getTableIDs(Account.table);
    if (!accounts) return;
    return accounts.data;
  }
}
