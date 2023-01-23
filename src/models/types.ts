export interface IAccount {
	id: string | undefined;
	name: string | undefined;
	era: ERA | undefined;
	certificates: {[key: string]: ICertificate};
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
