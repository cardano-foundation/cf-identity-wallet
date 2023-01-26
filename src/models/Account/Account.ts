import {ERA, IAccount, IAsset, ICertificate, INetwork, ITransaction, IUtxo, TX_STATUS,} from '../types';
import {get, getObject, removeObject, set, setObject,} from '../../db/storage';
import {Capacitor} from '@capacitor/core';
import {getKeystore, setKeystore} from '../../db/keystore';

export class Account implements IAccount {
  private table = 'accounts';
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
    if (Capacitor.getPlatform() !== 'web') {
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
    if (Capacitor.getPlatform() !== 'web') {
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

  commit() {
    if (!this.id || !this.id.length) return {error: `id is ${typeof this.id}`};
    setObject(this.table, this.id, this);
  }

  remove() {
    if (!this.id) return;
    removeObject('accounts', this.id);
  }

  toJson() {
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
    const accountInDb = await getObject('accounts', id);
    if (!accountInDb) return;
    return Account.new(accountInDb);
  }

  static removeAccount(id: string) {
    if (!id) return;
    removeObject('accounts', id);
  }

  static removeAllAccounts(id: string) {
    if (!id) return;
    set('accounts', {});
  }

  static async getAllAccounts() {
    return await get('accounts');
  }

  static async getAllAccountsIds() {
    const accounts = await get('accounts');
    if (!accounts) return;
    return Object.keys(accounts);
  }
}
