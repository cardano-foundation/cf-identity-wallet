import {CardanoAPI, ERA_PARAMS} from './CardanoAPI';
import {Account} from '../models/Account/Account';
import {ERA, INetwork} from '../models/types';
import {EmurgoModule} from './emurgo';

export const createAccount = async (
  name: string,
  mnemonic: string,
  era: ERA = ERA.SHELLEY,
  spendingPassword: string
) => {
  const account = new Account();

  const accountsNames = await Account.getAllAccountsIds();
  if (accountsNames && accountsNames.includes(name)) {
    throw `account name already exists: ${name}`;
  }

  const duplicatedName = await account.setName(name);

  // @ts-ignore
  if (duplicatedName && duplicatedName.error) throw 'duplicatedName';

  let rootKey = await CardanoAPI.generateRootKey(mnemonic);

  // @ts-ignore
  if (rootKey && rootKey.error) throw 'rootKey.error';

  // @ts-ignore
  const rootPublicKeyHex = Buffer.from(rootKey.to_public().as_bytes()).toString(
    'hex'
  );
  // @ts-ignore
  const rootKeyHex = Buffer.from(rootKey.as_bytes()).toString('hex');

  const excryptedRootKey = CardanoAPI.encrypt(spendingPassword, rootKeyHex);
  // @ts-ignore
  if (excryptedRootKey && excryptedRootKey.error) throw excryptedRootKey.error;

  // @ts-ignore
  let accountKey = CardanoAPI.deriveRootKey(
    rootKey,
    ERA_PARAMS[era].purpose,
    1815
  );
  account.era = era;

  // @ts-ignore
  rootKey.free();
  // @ts-ignore
  rootKey = null;

  // @ts-ignore
  account.setEncryptedRootKey(excryptedRootKey);
  account.rootPublicKeyHex = rootPublicKeyHex;

  // @ts-ignore
  if (accountKey && accountKey.error) throw 'accountKey.error';

  // @ts-ignore
  const testnetAddresses = await CardanoAPI.generateAddresses(accountKey, 0);
  // @ts-ignore
  if (testnetAddresses && testnetAddresses.error) throw testnetAddresses.error;

  // @ts-ignore
  const mainnetAddresses = await CardanoAPI.generateAddresses(accountKey, 1);
  // @ts-ignore
  if (mainnetAddresses && mainnetAddresses.error) throw mainnetAddresses.error;

  // @ts-ignore
  accountKey.free();
  // @ts-ignore
  accountKey = null;

  let netObj = {
    assets: {},
    utxos: [],
    collateral: [],
    vault: [],
    transactions: [],
  };

  const mainnetNetwork: INetwork = {
    ...netObj,
    stakeAddress: mainnetAddresses.stakeAddress,
    addresses: mainnetAddresses.paymentAddresses,
  };

  const testnetNetwork: INetwork = {
    ...netObj,
    stakeAddress: testnetAddresses.stakeAddress,
    addresses: testnetAddresses.paymentAddresses,
  };

  account.setNetwork('preview', testnetNetwork);
  account.setNetwork('preprod', testnetNetwork);
  account.setNetwork('custom', testnetNetwork);
  account.setNetwork('mainnet', mainnetNetwork);

  return account;
};
