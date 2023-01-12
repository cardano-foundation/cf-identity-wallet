import BigNumber from 'bignumber.js';
import {addBigNum} from '../utils/utils';

export interface ITransaction {
	txHash: string;
	type: string;
	blockTime: string;
	status: string;
	fees: string;
	amount: {[unit: string]: string};
	inputs: {
		otherAddresses: {
			address: string;
			amount: {unit: string; quantity: string}[];
		}[];
		usedAddresses: {
			address: string;
			amount: {unit: string; quantity: string}[];
		}[];
	};
	outputs: {
		otherAddresses: {
			address: string;
			amount: {unit: string; quantity: string}[];
		}[];
		usedAddresses: {
			address: string;
			amount: {unit: string; quantity: string}[];
		}[];
	};
}

// @ts-ignore
export const mergeAssetsFromUtxosByUnit = (utxos) => {
	let assets: {[key: string]: string} = {};
	// @ts-ignore
	utxos.map((utxo) => {
		// @ts-ignore
		utxo.utxos.map((u) => {
			// @ts-ignore
			u.amount.map((a) => {
				if (assets[a.unit] === undefined) {
					assets[a.unit] = a.quantity;
				} else {
					let x = new BigNumber(assets[a.unit]);
					let y = new BigNumber(a.quantity);
					const sum = x.plus(y).toString();
					assets[a.unit] = sum;
				}
			});
		});
	});
	return assets;
};

export const RECEIVE_TX = 'RECEIVE_TX';
export const SEND_TX = 'SEND_TX';
export const SELF_TX = 'SELF_TX';

export const classifyTx = async (
	transaction: {
		address: string;
		block_height: number;
		block_time: number;
		tx_hash: string;
		tx_index: number;
		status: string;
		fees: string;
		utxos: any;
	},
	accountAddresses: any[]
) => {
	const block_time = transaction.block_time;
	const fees = transaction.fees;
	const txHash = transaction.tx_hash;
	const inputs = transaction.utxos.inputs;
	const outputs = transaction.utxos.outputs;

	const accInInputs = addressInCommon(inputs, accountAddresses);
	const accInOutputs = addressInCommon(outputs, accountAddresses);

	const othersInInputs = containOtherAddresses(inputs, accountAddresses);
	const othersInOutputs = containOtherAddresses(outputs, accountAddresses);

	let txType = SELF_TX;
	if (accInInputs && !othersInInputs && accInOutputs && !othersInOutputs) {
		txType = SELF_TX;
	} else if (!accInInputs && accInOutputs) {
		txType = RECEIVE_TX;
	} else if (accInInputs && !accInOutputs) {
		txType = SEND_TX;
	} else if (accInInputs && accInOutputs) {
		const othersInInputs = containOtherAddresses(inputs, accountAddresses);
		if (!othersInInputs) {
			txType = SEND_TX;
		}
	}

	const processedIn = processInputs(inputs, accountAddresses);
	const processedOut = processOutputs(outputs, accountAddresses);

	const usedInInputs = processedIn.usedAddresses;
	const usedInOutputs = processedOut.usedAddresses;
	const otherInOutputs = processedOut.otherAddresses;

	switch (txType) {
		case SEND_TX:
			let amountOutputList: any[] = [];
			let amountInputList: any[] = [];

			usedInInputs.map((ioutput) => {
				// @ts-ignore
				amountInputList = [...amountInputList, ...ioutput.amount];
			});

			otherInOutputs.map((uoutput) => {
				// @ts-ignore
				amountOutputList = [...amountOutputList, ...uoutput.amount];
			});

			const mergedOutputsAmount = await mergeAmounts(amountOutputList);

			return {
				txHash,
				blockTime: block_time,
				inputs: processedIn,
				outputs: processedOut,
				amount: mergedOutputsAmount,
				fees,
				type: txType,
				status: 'confirmed',
			};

		case RECEIVE_TX:
			let amountOutputs: any[] = [];
			usedInOutputs.map((uoutput) => {
				// @ts-ignore
				amountOutputs = [...amountOutputs, ...uoutput.amount];
			});
			let mergedOutputs = await mergeAmounts(amountOutputs);
			return {
				txHash,
				blockTime: block_time,
				inputs: processedIn,
				outputs: processedOut,
				amount: mergedOutputs,
				fees,
				type: txType,
				status: 'confirmed',
			};
		case SELF_TX:
			amountOutputs = [];
			usedInOutputs.map((uoutput) => {
				// @ts-ignore
				amountOutputs = [...amountOutputs, ...uoutput.amount];
			});
			mergedOutputs = await mergeAmounts(amountOutputs);
			return {
				txHash,
				blockTime: block_time,
				inputs: processedIn,
				outputs: processedOut,
				amount: mergedOutputs,
				fees,
				type: txType,
				status: 'confirmed',
			};
		default:
			return {
				txHash,
				blockTime: block_time,
				inputs: processedIn,
				outputs: processedOut,
				amount: {},
				fees,
				type: txType,
			};
	}
};

export const addressInCommon = (array1: any[], array2: any[]) => {
	const found = array1.some((r1) => {
		let f = false;
		array2.map((r2) => {
			if (r2.address === r1.address) {
				f = true;
			}
		});
		return f;
	});
	return found;
};

export const containOtherAddresses = (
	addressesToCheck: any[],
	allAddresses: any[]
) => {
	const addressesFromOthers = addressesToCheck.filter((addr) => {
		return !allAddresses.some((a) => a.address === addr.address);
	});

	return addressesFromOthers.length > 0;
};

export const processInputs = (inputs: any[], allAddresses: any[]) => {
	let usedAddresses: {amount: string; address: string}[] = [];
	let otherAddresses: {amount: string; address: string}[] = [];
	inputs.map((input) => {
		const amount = input.amount;
		const address = input.address;
		let inputFromAccount = false;
		allAddresses.map((addr) => {
			if (addr.address === address) {
				inputFromAccount = true;
			}
		});

		if (inputFromAccount) {
			usedAddresses.push({amount, address});
		} else {
			otherAddresses.push({amount, address});
		}
	});
	return {usedAddresses, otherAddresses};
};
export const processOutputs = (outputs: any[], allAddresses: any[]) => {
	let usedAddresses: {amount: string; address: string}[] = [];
	let otherAddresses: {amount: string; address: string}[] = [];

	outputs.map((output) => {
		const amount = output.amount;
		const address = output.address;
		let inputFromAccount = false;
		allAddresses.map((addr) => {
			// if the addr belongs to the user account
			if (addr.address === address) {
				inputFromAccount = true;
			}
		});

		if (inputFromAccount) {
			usedAddresses.push({amount, address});
		} else {
			otherAddresses.push({amount, address});
		}
	});
	return {usedAddresses, otherAddresses};
};

export const mergeAmounts = async (amounts: any[]) => {
	let amountDict: {[unit: string]: string} = {};

	amounts.map((amount) => {
		if (amountDict[amount.unit] === undefined) {
			amountDict[amount.unit] = amount.quantity;
		} else {
			// @ts-ignore
			amountDict[amount.unit] = addBigNum(
				amountDict[amount.unit],
				amount.quantity
			);
		}
	});

	return amountDict;
};
