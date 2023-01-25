import {
  ERA,
  IAccount,
  IAddress,
  IAsset,
  ICertificate,
  ITransaction,
  IUtxo,
  TX_STATUS,
} from '../types';
import {get, keys, remove, set} from '../../db/storage';

export class Account implements IAccount {
  private static table: string;
  table = 'account';
  id: string | undefined;
  name: string | undefined;
  certificates: {[key: string]: ICertificate};
  era: ERA | undefined;
  network: {
    [key: string]: {
      assets: {[unit: string]: IAsset};
      utxos: IUtxo[];
      collateral: string[];
      vault: string[];
      addresses: IAddress[];
      transactions: ITransaction[];
    };
  };

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.certificates = {};
    this.era = undefined;
    this.network = {};
  }

  set(account: IAccount) {
    this.id = account.id;
    this.name = account.name;
    this.certificates = account.certificates;
    this.era = account.era;
    this.network = account.network;
  }

  balance(network: string) {
    return this.network[network]?.assets['lovelace'];
  }

  setCertificate(
    name: string,
    key: string,
    data: string,
    derivation = undefined
  ) {
    this.certificates[name] = {
      key,
      data,
      derivation,
    };
  }

  setAssets(network: string, assets: {[p: string]: IAsset}) {
    this.network[network] = {
      ...this.network[network],
      assets,
    };
  }

  asset(network: string, unit: string) {
    return this.network[network]?.assets[unit];
  }

  setUtxos(network: string, utxos: IUtxo[]) {
    this.network[network] = {
      ...this.network[network],
      utxos,
    };
  }

  address(network: string, index: number, chain: number) {
    return this.network[network].addresses.find(
      (address) => address.index === index && address.chain === chain
    );
  }

  externalAddresses(network: string) {
    return this.network[network].addresses.filter(
      (address) => address.chain === 0
    );
  }

  internalAddresses(network: string) {
    return this.network[network].addresses.filter(
      (address) => address.chain === 1
    );
  }

  unusedAddresses(network: string) {
    return this.network[network].addresses.filter((address) => !address.used);
  }

  setUsedAddress(address: string) {
    // TODO:
  }

  pendingTransactions(network: string) {
    return this.network[network].transactions.filter(
      (tx) => tx.status === TX_STATUS.PENDING
    );
  }

  addTransaction(network: string, tx: ITransaction) {
    if (!this.network[network]?.transactions?.length) {
      this.network[network] = {
        ...this.network[network],
        transactions: [],
      };
    }
    const index = this.network[network].transactions.findIndex(
      (t) => t.txHash === tx.txHash
    );
    this.network[network].transactions[index <= 0 ? 0 : index] = tx;
  }

  async remove() {
    await remove(`${this.table}:${this.id}`);
  }

  async commit() {
    if (!this.id) return;
    await set(`${this.table}:${this.id}`, this.toJson());
  }

  toJson() {
    try {
      return JSON.stringify({
        id: this.id,
        name: this.name,
        era: this.era,
        certificates: this.certificates,
        network: this.network,
      });
    } catch (e) {
      return {
        error: e,
      };
    }
  }

  static fromJson(json: string) {
    try {
      const jsonObj = JSON.parse(json);
      const account = new Account();
      account.id = jsonObj.id;
      account.name = jsonObj.name;
      account.certificates = jsonObj.certificates;
      account.era = jsonObj.era;
      account.network = jsonObj.network;
      return account;
    } catch (e) {
      return {
        error: e,
      };
    }
  }

  static async getAllAccountIds() {
    const allKeys = await keys();
    if (!allKeys) return;
    return Object.values(allKeys)
      .filter((id) => id.includes(`${this.table}:`))
      .map((id) => id.replace(`${this.table}:`, ''));
  }
}
