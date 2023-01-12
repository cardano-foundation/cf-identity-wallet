import {
  generateMnemonic,
  mnemonicToEntropy,
  validateMnemonic as validateMne,
} from 'bip39';
const Buffer = require('buffer/').Buffer;
import {
  DERIVE_COIN_TYPE,
  DERIVE_PUROPOSE,
  GLOBAL_TAG,
  MAINNET_NETWORK_INDEX,
  numbers,
  TESTNET_NETWORK_INDEX,
  TOTAL_ADDRESS_INDEX,
} from './config';
import cryptoRandomString from 'crypto-random-string';
import { EmurgoModule } from './emurgo';
import { customAlphabet } from 'nanoid';
import { fromUTF8 } from '../utils/utils';
import { getNetworkFromDb } from '../db';

export const generateMnemonicSeed = (size: number) => {
  return generateMnemonic(size);
};

export function validateMnemonic(mnemonic: string) {
  return validateMne(mnemonic);
}

export const harden = (num: number) => {
  return 0x80000000 + num;
};

export const createAccount = async (
  name: string,
  mnemonic: string,
  pass: string
) => {
  const Cardano = await EmurgoModule.CardanoWasm();

  const privateKeyPtr = await generateWalletRootKey(mnemonic);
  // @ts-ignore
  const privateKeyHex = Buffer.from(privateKeyPtr.as_bytes()).toString('hex');
  //const encryptedPrivateKey = "";
  const encryptedPrivateKey = await encrypt(privateKeyHex, pass);
  // @ts-ignore
  const publicKey = privateKeyPtr.to_public();
  const publicKeyHex = Buffer.from(publicKey.as_bytes()).toString('hex');

  const accountKey = deriveAccountKey(privateKeyPtr);

  // Stake key
  const stakeKey = accountKey.derive(numbers.ChainDerivations.ChimericAccount);
  const stakeKey2 = stakeKey.derive(numbers.StakingKeyIndex);
  const stakeKey3 = stakeKey2.to_raw_key();

  const stakeKeyPub = stakeKey3.to_public();

  const stakeAddressTestnet = Cardano.RewardAddress.new(
    0,
    Cardano.StakeCredential.from_keyhash(stakeKeyPub.hash())
  )
    .to_address()
    .to_bech32();

  const stakeAddressMainnet = Cardano.RewardAddress.new(
    1,
    Cardano.StakeCredential.from_keyhash(stakeKeyPub.hash())
  )
    .to_address()
    .to_bech32();

  const mainnetAddresses = await generateAddresses(
    accountKey,
    1,
    TOTAL_ADDRESS_INDEX
  );
  const testnetAddresses = await generateAddresses(
    accountKey,
    0,
    TOTAL_ADDRESS_INDEX
  );

  let account: { [network: string]: any } = {};
  const testnetAccount = {
    balance: '0',
    utxos: [],
    assets: {},
    history: [],
    pendingTxs: [],
    publicKeyHex,
    stakeAddress: stakeAddressTestnet,
    selectedAddress: testnetAddresses.externalPubAddresses[0],
    internalPubAddress: testnetAddresses.internalPubAddresses,
    externalPubAddress: testnetAddresses.externalPubAddresses,
    delegated: false,
    activeEpoch: 0,
    poolId: '',
    rewardsSum: 0,
    withdrawableAmount: 0,
    mode: 'Full',
    rooms: {
      server: {},
      client: {},
    },
  };
  account['preprod'] = testnetAccount;
  account['preview'] = testnetAccount;
  account['mainnet'] = {
    encryptedPrivateKey,
    balance: '0',
    utxos: [],
    assets: {},
    history: [],
    pendingTxs: [],
    publicKeyHex,
    stakeAddress: stakeAddressMainnet,
    selectedAddress: mainnetAddresses.externalPubAddresses[0],
    internalPubAddress: mainnetAddresses.internalPubAddresses,
    externalPubAddress: mainnetAddresses.externalPubAddresses,
    delegated: false,
    activeEpoch: 0,
    poolId: '',
    rewardsSum: 0,
    withdrawableAmount: 0,
    mode: 'Full',
    rooms: {
      server: {},
      client: {},
    },
  };

  account = { ...account, name, id: undefined };
  return account;
};

export const generateWalletRootKey = async (mnemonic: string) => {
  const Cardano = await EmurgoModule.CardanoWasm();

  const bip39entropy = mnemonicToEntropy(mnemonic);
  const EMPTY_PASSWORD = Buffer.from('');
  let rootKey;
  try {
    rootKey = Cardano.Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(bip39entropy, 'hex'),
      EMPTY_PASSWORD
    );
  } catch (e) {
    console.log('error');
    console.log(e);
  }

  // @ts-ignore
  return rootKey;
};

export const deriveAccountKey = (key: any, index: number = 0) => {
  return key
    .derive(harden(DERIVE_PUROPOSE))
    .derive(harden(DERIVE_COIN_TYPE))
    .derive(harden(index));
};

export const generateAddresses = async (
  accountKey: any,
  networkId: number,
  totalAddresses: number
) => {
  const externalPubAddresses = [];
  for (let i = 0; i < totalAddresses; i++) {
    const externalPubAddress = await generatePayAddress(
      accountKey,
      0,
      i,
      networkId
    );

    if (externalPubAddress && externalPubAddress.length) {
      externalPubAddresses.push({
        index: i,
        network: networkId,
        reference: '',
        tags: [],
        address: externalPubAddress,
        chain: 0,
      });
    }
  }

  const internalPubAddresses = [];
  for (let i = 0; i < totalAddresses; i++) {
    const internalPubAddress = await generatePayAddress(
      accountKey,
      1,
      i,
      networkId
    );

    if (internalPubAddress && internalPubAddress.length) {
      internalPubAddresses.push({
        index: i,
        network: networkId,
        reference: '',
        tags: [],
        address: internalPubAddress,
        chain: 1,
      });
    }
  }

  return {
    externalPubAddresses,
    internalPubAddresses,
  };
};

export const generatePayAddress = async (
  // @ts-ignore
  accountKey: any,
  chain: number,
  index: number,
  networkId: number
) => {
  const Cardano = await EmurgoModule.CardanoWasm();

  let stakeKey;
  let stakeKeyPub;
  try {
    stakeKey = accountKey
      .derive(numbers.ChainDerivations.ChimericAccount)
      .derive(numbers.StakingKeyIndex)
      .to_raw_key();
    stakeKeyPub = stakeKey.to_public();
  } catch (e) {
    console.log(e);
  }

  let paymentKeyPub;
  try {
    const paymentKey = accountKey.derive(chain).derive(index).to_raw_key();
    paymentKeyPub = paymentKey.to_public();
  } catch (e) {
    console.log(e);
  }
  try {
    const addr = Cardano.BaseAddress.new(
      networkId,
      // @ts-ignore
      Cardano.StakeCredential.from_keyhash(paymentKeyPub.hash()),
      // @ts-ignore
      Cardano.StakeCredential.from_keyhash(stakeKeyPub.hash())
    );
    return addr.to_address().to_bech32();
  } catch (e) {
    console.log(e);
  }
};

export const encryptWithPassword = async (password: string, data: string) => {
  const Cardano = await EmurgoModule.CardanoWasm();
  const passwordHex = Buffer.from(password, 'utf8').toString('hex');

  const salt = cryptoRandomString(2 * 32);
  const nonce = cryptoRandomString(2 * 12);
  return Cardano.encrypt_with_password(passwordHex, salt, nonce, data);
};

export const decryptWithPassword = async (password: string, data: string) => {
  const Cardano = await EmurgoModule.CardanoWasm();

  const passwordHex = Buffer.from(password, 'utf8').toString('hex');
  try {
    // Buffer.from(decryptedPassword, 'hex')
    return Cardano.decrypt_with_password(passwordHex, data);
  } catch (error) {
    console.log('Error on decrypt');
    console.log(error);
    throw error;
  }
};

export const encrypt = async (data: string, password: string) => {
  const Cardano = await EmurgoModule.CardanoWasm();
  const passwordHex = Buffer.from(password, 'utf8').toString('hex');

  const salt = cryptoRandomString(2 * 32);
  const nonce = cryptoRandomString(2 * 12);
  return Cardano.encrypt_with_password(passwordHex, salt, nonce, data);
};

export const decrypt = async (data: string, password: string) => {
  const Cardano = await EmurgoModule.CardanoWasm();
  try {
    return Cardano.decrypt_with_password(fromUTF8(password), data);
  } catch (error) {
    throw new Error('The password is incorrect.');
  }
};
export const requestAccountKeys = async (
  encryptedPrivateKey: string,
  password: string,
  chain = 0,
  accountIndex = 0
) => {
  const Cardano = await EmurgoModule.CardanoWasm();
  let accountKey;
  try {
    const privateKey = await decrypt(encryptedPrivateKey, password);
    accountKey = Cardano.Bip32PrivateKey.from_hex(privateKey)
      .derive(harden(1852))
      .derive(harden(1815)) // coin type;
      .derive(harden(0));
  } catch (e) {
    throw e;
  }

  return {
    accountKey,
    paymentKey: accountKey.derive(chain).derive(accountIndex).to_raw_key(),
    stakeKey: accountKey.derive(2).derive(0).to_raw_key(),
  };
};
