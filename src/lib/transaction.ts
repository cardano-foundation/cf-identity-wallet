import {getProtocolParameters, submitTx} from '../api/blockfrost';
import {Transaction} from '@martifylabs/mesh';
import {getAccountFromDb, getNetworkFromDb, getSettingsFromDb} from '../db';
import {EmurgoModule} from './emurgo';
import BigNumber from 'bignumber.js';
import {amountIsValid} from '../utils/utils';
import {transactionMinFee} from './dcspark/utils';
import {submitTransaction} from '../api/graphql';
import {requestAccountKeys} from './account';

//import { submitTransaction } from '../api/graphql';

export interface IAsset {
  quantity: string;
  unit: string;
}

export const getUsedAddress = async () => {
  const account = await getAccountFromDb();
  const network = await getNetworkFromDb();
  const address = account[network.net].externalPubAddress[0];

  const Cardano = await EmurgoModule.CardanoWasm();
  return Cardano.Address.from_bech32(address);
};

export const getUsedCollateral = async () => {
  // TODO
  return [];
};
export const getUsedUTxOs = async () => {
  let account = await getAccountFromDb();

  const network = await getNetworkFromDb();
  account = account[network.net];

  if (!account) return;

  const Cardano = await EmurgoModule.CardanoWasm();
  let utxos: any[] = [];

  await Promise.all(
    account.utxos.map(async (utxo: any) => {
      await Promise.all(
        utxo.utxos.map(async (u: any) => {
          const value = await assetsToValue(u.amount);
          const TUO = Cardano.TransactionUnspentOutput.new(
            Cardano.TransactionInput.new(
              Cardano.TransactionHash.from_bytes(Buffer.from(u.tx_hash, 'hex')),
              u.tx_index
            ),
            Cardano.TransactionOutput.new(
              Cardano.Address.from_bech32(utxo.address),
              value
            )
          );
          utxos.push(TUO);
        })
      );
    })
  );

  return utxos;
};

// @ts-ignore
export const WalletApi = {
  // @ts-ignore
  getUsedAddress: () => getUsedAddress(),
  // @ts-ignore
  getUsedCollateral: () => getUsedCollateral(),
  // @ts-ignore
  getUsedUTxOs: () => getUsedUTxOs(),
};

/*
export const signAndSubmit = async (
	currentAccount: any,
	outputs: {
		addressToSend: string;
		assets: {unit: string; quantity: string}[];
	}[],
	metadataToSend: string,
	password?: string,
	sign: boolean = false
) => {
	if (!currentAccount) return {error: 'Account not found'};

	try {
		const filteredOutputs = outputs.filter(
			(output) =>
				output.addressToSend !== '' &&
				amountIsValid(
					output.assets.find((asset) => asset.unit === 'lovelace')?.quantity ||
						''
				)
		);

		if (!filteredOutputs?.length) return;

		const Cardano = await EmurgoModule.CardanoWasm();

		const protocolParams = await getProtocolParameters();

		const tx = new Transaction({
			initiator: WalletApi,
			parameters: protocolParams,
		});

		filteredOutputs.map((output) => {
			const lovelacesAsset = output.assets.find(
				(asset) => asset.unit === 'lovelace'
			);

			if (lovelacesAsset?.quantity) {
				const lovelaces = new BigNumber(lovelacesAsset.quantity.toString())
					.multipliedBy(new BigNumber(10).pow(6))
					.toString();
				tx.sendLovelace(output.addressToSend, lovelaces);
			}

			const assets = output.assets.filter((asset) => asset.unit !== 'lovelace');

			if (assets?.length) {
				tx.sendAssets(output.addressToSend, assets);
			}
		});

		if (metadataToSend && metadataToSend.length) {
			tx.setMetadata(20, metadataToSend);
		}

		tx.setChangeAddress(currentAccount.externalPubAddress[0].address);

		const unsignedTx = await tx.build();

		const unsignedTransaction = Cardano.Transaction.from_hex(unsignedTx);

		const metadata = unsignedTransaction.auxiliary_data();

		let fee = await transactionMinFee(
			unsignedTransaction.to_bytes(),
			{
				minFeeA: protocolParams.minFeeA,
				minFeeB: protocolParams.minFeeB,
			},
			{
				memPrice: protocolParams.priceMem,
				stepPrice: protocolParams.priceStep,
			}
		);

		let witnessesSetDraft = await Cardano.TransactionWitnessSet.new();
		let vkeyWitnessesDraft = await Cardano.Vkeywitnesses.new();

		let txHex = '';

		if (sign && password && password.length) {
			const utxos = await WalletApi.getUsedUTxOs();

			// @ts-ignore
			const usedAddresses = [
				...new Set(
					utxos?.map((utxo) => JSON.parse(utxo.to_json()).output.address)
				),
			];

			const txBody = unsignedTransaction.body();
			const txHash = await Cardano.hash_transaction(txBody);
			const allAddresses = [
				...currentAccount.externalPubAddress,
				...currentAccount.internalPubAddress,
			];

			for (const addr of usedAddresses) {
				const address = allAddresses.find((a) => a.address === addr);
				const accountKeys = await requestAccountKeys(
					currentAccount.encryptedPrivateKey,
					password,
					address.chain,
					address.index
				);

				const paymentKey = accountKeys.paymentKey;
				const stakeKey = accountKeys.stakeKey;

				const vkeyWitnessDraft = Cardano.make_vkey_witness(txHash, paymentKey);
				await vkeyWitnessesDraft.add(vkeyWitnessDraft);
				const stakeKeyVitnessDraft = Cardano.make_vkey_witness(
					txHash,
					stakeKey
				);
				await vkeyWitnessesDraft.add(stakeKeyVitnessDraft);
			}

			await witnessesSetDraft.set_vkeys(vkeyWitnessesDraft);

			const signedTxDraft = Cardano.Transaction.new(
				unsignedTransaction.body(),
				witnessesSetDraft,
				metadata
			);

			const txBytesDraft = signedTxDraft.to_bytes();
			txHex = Buffer.from(txBytesDraft).toString('hex');

			fee = await transactionMinFee(
				signedTxDraft.to_bytes(),
				{
					minFeeA: protocolParams.minFeeA,
					minFeeB: protocolParams.minFeeB,
				},
				{
					memPrice: protocolParams.priceMem,
					stepPrice: protocolParams.priceStep,
				}
			);

			let bodyJSON = JSON.parse(txBody.to_json());

			const diffFee = new BigNumber(fee.to_str())
				.minus(new BigNumber(bodyJSON.fee))
				.toString();

			const outputs = bodyJSON.outputs;

			let updatedOutputs = [];
			for (let output of outputs) {
				if (currentAccount.externalPubAddress[0].address === output.address) {
					output.amount.coin = new BigNumber(output.amount.coin)
						.minus(new BigNumber(diffFee))
						.toString();
					updatedOutputs.push(output);
				} else {
					updatedOutputs.push(output);
				}
			}

			bodyJSON.outputs = updatedOutputs;
			bodyJSON.fee = new BigNumber(bodyJSON.fee)
				.plus(new BigNumber(diffFee))
				.toString();

			const nTxBody = Cardano.TransactionBody.from_json(
				JSON.stringify(bodyJSON)
			);

			let witnessesSet = await Cardano.TransactionWitnessSet.new();
			let vkeyWitnesses = await Cardano.Vkeywitnesses.new();

			const ntxHash = await Cardano.hash_transaction(nTxBody);
			for (const addr of usedAddresses) {
				const address = allAddresses.find((a) => a.address === addr);
				const accountKeys = await requestAccountKeys(
					currentAccount.encryptedPrivateKey,
					password,
					address.chain,
					address.index
				);

				const paymentKey = accountKeys.paymentKey;
				const stakeKey = accountKeys.stakeKey;

				const vkeyWitness = Cardano.make_vkey_witness(ntxHash, paymentKey);
				await vkeyWitnesses.add(vkeyWitness);
				const stakeKeyVitness = Cardano.make_vkey_witness(ntxHash, stakeKey);
				await vkeyWitnesses.add(stakeKeyVitness);
			}

			await witnessesSet.set_vkeys(vkeyWitnesses);

			const signedTx = Cardano.Transaction.new(nTxBody, witnessesSet, metadata);

			fee = await transactionMinFee(
				signedTx.to_bytes(),
				{
					minFeeA: protocolParams.minFeeA,
					minFeeB: protocolParams.minFeeB,
				},
				{
					memPrice: protocolParams.priceMem,
					stepPrice: protocolParams.priceStep,
				}
			);

			const txBytes = signedTx.to_bytes();
			txHex = Buffer.from(txBytes).toString('hex');

			try {
				const txHashSubmitted = await submitTransaction(
					//GRAPHQL_DEFAULT_URL,
					'http://192.168.0.25:3101/graphql',
					txHex
				);

				if (!txHashSubmitted.data.data) {
					return {
						error: JSON.stringify(
							txHashSubmitted.data.errors[0].extensions.reasons
						),
					};
				}

				await submitTx(txHex);
			} catch (e) {
				return {
					error: 'Submit failed',
				};
			}
		}

		return {
			fee: fee.to_str(),
			transaction: txHex,
		};
	} catch (e) {
		console.log('ERROR');
		return {
			error: e,
		};
	}
};
 */

export const assetsToValue = async (assets: IAsset[]) => {
  const Cardano = await EmurgoModule.CardanoWasm();
  const multiAsset = Cardano.MultiAsset.new();
  const lovelace = assets.find((asset: IAsset) => asset.unit === 'lovelace');
  const policies = [
    // @ts-ignore
    ...new Set(
      assets
        .filter((asset: IAsset) => asset.unit !== 'lovelace')
        .map((asset: IAsset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy: any) => {
    const policyAssets = assets.filter(
      (asset: IAsset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Cardano.Assets.new();
    policyAssets.forEach((asset: IAsset) => {
      assetsValue.insert(
        Cardano.AssetName.new(Buffer.from(asset.unit.slice(56), 'hex')),
        Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Cardano.ScriptHash.from_bytes(Buffer.from(policy, 'hex')),
      assetsValue
    );
  });
  const value = Cardano.Value.new(
    Cardano.BigNum.from_str(lovelace ? lovelace.quantity : '0')
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);

  return value;
};
