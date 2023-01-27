export interface IAccount {
  id: string | undefined;
  name: string | undefined;
  encryptedRootKey: string | undefined;
  certificates: {
    [key: string]: ICertificate;
  };
  networks: {
    [key: string]: INetwork;
  };
  era: ERA | undefined;
  rootPublicKeyHex: string | undefined;
}

export interface ICertificate {
  key: string;
  data: string;
  derivation?: string; // TODO
}

export interface IUtxo {
  address: string;
  hash: string;
  inputs: any[]; // TODO
  outputs: any[]; // TODO
  datetime: string;
  vault: boolean;
}
export interface INetwork {
  assets: {[unit: string]: IAsset};
  utxos: IUtxo[];
  collateral: string[];
  vault: string[];
  stakeAddress: string;
  addresses: IAddress[];
  transactions: ITransaction[];
}

export interface IAddress {
  address: string;
  index: number;
  networkId: number;
  chain: number;
  used: boolean;
  tags: string[];
}

export interface IAsset {
  quantity: string;
  unit: string;
  name: string;
  // ... TODO
}

export interface ITransaction {
  txHash: string;
  type: TX_TYPE;
  status: TX_STATUS;
  inputs: IUtxo[];
  outputs: IUtxo[];
  assets: IAsset[];
  datetime: string;
}

export interface IStaking {
  stakeAddress: boolean;
  delegated: boolean;
  stakePoolName: string;
  stakePoolId: string;
  rewards: IReward[];
}

export interface IReward {
  quantity: string;
  datetime: string;
  stakePoolId: string;
  stakePoolName: string;
}

export enum PK_PATHS {
  MULTISIG = '/1854/1815/0/0/0',
  SHELLEY = '/1852/1815/0/0/0',
  BYRON = '/44/1815/0/0/0',
}
export enum ERA {
  BYRON = 'BYRON',
  SHELLEY = 'SHELLEY',
}

export enum TX_TYPE {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SELF = 'SELF',
  SCRIPT = 'SCRIPT',
}

export enum TX_STATUS {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  MEMPOOL = 'MEMPOOL',
}
