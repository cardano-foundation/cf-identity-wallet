import { BLOCKFROST_TOKEN, NETWORK, SUBMIT_DEFAULT_URL } from '../../config';
import axios from 'axios';
import { getNetworkFromDb } from '../db';

const BLOCKFROST_URL = `https://blockfrost-api.${NETWORK}.dandelion.link/`;

export const blockfrostAPI = axios.create({
  baseURL: BLOCKFROST_URL,
});

export const getBlockchainState = async () => {
  const result = await fetchBlockfrost('epochs/latest');
  if (!result || result.error) return null;
  return result;
};

export const getLatestBlock = async () => {
  const result = await fetchBlockfrost('blocks/latest');
  if (!result || result.error) return null;
  return result;
};

export const getProtocolParameters = async () => {
  const latest_block = await getLatestBlock();
  const p = await fetchBlockfrost(`/epochs/${latest_block.epoch}/parameters`);

  return {
    minUtxo: '1000000', //p.min_utxo, minUTxOValue protocol paramter has been removed since Alonzo HF. Calulation of minADA works differently now, but 1 minADA still sufficient for now
    poolDeposit: p.pool_deposit,
    keyDeposit: p.key_deposit,
    coinsPerUTxOSize: p.coins_per_utxo_size,
    maxValSize: p.max_val_size,
    priceMem: p.price_mem,
    priceStep: p.price_step,
    maxTxSize: p.max_tx_size,
    slot: latest_block.slot,
    collateralPercent: p.collateral_percent,
    decentralisation: p.decentralisation_param,
    epoch: p.epoch,
    maxBlockExMem: p.max_block_ex_mem,
    maxBlockExSteps: p.max_block_ex_steps,
    maxBlockHeaderSize: p.max_block_header_size,
    maxBlockSize: p.max_block_size,
    maxCollateralInputs: p.max_collateral_inputs,
    maxTxExMem: p.max_tx_ex_mem,
    maxTxExSteps: p.max_tx_ex_steps,
    minFeeA: p.min_fee_a,
    minFeeB: p.min_fee_b,
    minPoolCost: p.min_pool_cost,
  };
};

export const getAccountState = async (stakeAddress: string) => {
  const result = await fetchBlockfrost(`accounts/${stakeAddress}`);
  if (!result || result.error) return null;
  return result;
};

export const getAddressesWithAssets = async (stakeAddress: string) => {
  const result = await fetchBlockfrost(`accounts/${stakeAddress}/addresses`);
  if (!result || result.error) return null;
  return result;
};

export const getTxUTxOsByAddress = async (address: string) => {
  const result = await fetchBlockfrost(`addresses/${address}/utxos`);
  if (!result || result.error) return null;
  return result;
};

export const getTxInfo = async (txHash: string) => {
  const result = await fetchBlockfrost(`/txs/${txHash}`);
  if (!result || result.error) return null;
  return result;
};

export const getTxUTxOs = async (txHash: string) => {
  const result = await fetchBlockfrost(`/txs/${txHash}/utxos`);
  if (!result || result.error) return null;
  return result;
};

export const submitApi = async (txHex: string) => {
  const network = await getNetworkFromDb();
  const url = network.blockfrost.url + `/tx/submit`;
  return await axios
    .post(url, txHex, {
      headers: {
        'Content-Type': 'application/cbor',
        project_id: network.blockfrost.token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export const submitTx = async (data: string) => {
  const network = await getNetworkFromDb();
  const url = network.blockfrost.url + `tx/submit`;
  //const url = SUBMIT_DEFAULT_URL;
  try {
    return await fetch(url, {
      headers: {
        //Authorization: `Bearer \${${token}}`,
        project_id: network.blockfrost.token,
        'Content-Type': 'application/cbor',
        'User-Agent': 'id-wallet',
        'Cache-Control': 'no-cache',
      },
      method: Buffer.from(data, 'hex') ? 'POST' : 'GET',
      body: Buffer.from(data, 'hex'),
    });
  } catch (e) {
    return {
      error: e,
    };
  }
};

export const fetchBlockfrost = async (endpoint: string) => {
  const network = await getNetworkFromDb();
  const url = network.blockfrost.url + `${endpoint}`;
  const config = {
    method: 'GET',
    url,
    headers: {
      project_id: network.blockfrost.token,
    },
  };

  return axios(config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};
