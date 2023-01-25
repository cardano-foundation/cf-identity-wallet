import {CardanoApi, ERA_PARAMS} from './ CardanoAPI';
import {Account} from '../models/Account/Account';
import {ERA, INetwork} from '../models/types';

export const createAccount = async (
  name: string,
  mnemonic: string,
  era: ERA = ERA.SHELLEY,
  spendingPassword: string
) => {
  const account = new Account();
  const duplicatedName = await account.setName(name);

  // @ts-ignore
  if (duplicatedName && duplicatedName.error) return duplicatedName.error;

  let rootKey = await CardanoApi.generateRootKey(mnemonic);

  // @ts-ignore
  if (rootKey && rootKey.error) return rootKey.error;

  // @ts-ignore
  const rootPublicKeyHex = Buffer.from(rootKey.to_public().as_bytes()).toString(
    'hex'
  );
  // @ts-ignore
  const rootKeyHex = Buffer.from(rootKey.as_bytes()).toString('hex');

  const excryptedRootKey = CardanoApi.encrypt(spendingPassword, rootKeyHex);
  // @ts-ignore
  if (excryptedRootKey && excryptedRootKey.error) return excryptedRootKey.error;

  // @ts-ignore
  let accountKey = CardanoApi.deriveRootKey(
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
  if (accountKey && accountKey.error) return accountKey.error;

  // @ts-ignore
  const testnetAddresses = await CardanoApi.generateAddresses(accountKey, 0);
  // @ts-ignore
  if (testnetAddresses && testnetAddresses.error) return testnetAddresses.error;

  // @ts-ignore
  const mainnetAddresses = await CardanoApi.generateAddresses(accountKey, 1);
  // @ts-ignore
  if (mainnetAddresses && mainnetAddresses.error) return mainnetAddresses.error;

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
