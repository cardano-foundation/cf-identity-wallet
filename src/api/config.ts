export const SENDER = {extension: 'extension', webpage: 'webpage'};
export const METHOD = {
  isWhitelisted: 'isWhitelisted',
  enable: 'enable',
  isEnabled: 'isEnabled',
  currentWebpage: 'currentWebpage',
  getNetworkId: 'getNetworkId',
  getBalance: 'getBalance',
  getDelegation: 'getDelegation',
  getUtxos: 'getUtxos',
  getCollateral: 'getCollateral',
  getRewardAddress: 'getRewardAddress',
  getAddress: 'getAddress',
  signData: 'signData',
  signTx: 'signTx',
  submitTx: 'submitTx',
  //internal
  requestData: 'requestData',
  returnData: 'returnData',
};

export const STORAGE = {
  whitelisted: 'whitelisted',
  encryptedKey: 'encryptedKey',
  accounts: 'accounts',
  currentAccount: 'currentAccount',
  network: 'network',
  currency: 'currency',
  migration: 'migration',
};

export const NODE = {
  preprod: 'https://cardano-preprod.blockfrost.io/api/v0',
};

export const ERROR = {
  accessDenied: 'Access denied',
  wrongPassword: 'Wrong password',
  txTooBig: 'Transaction too big',
  txNotPossible: 'Transaction not possible',
  storeNotEmpty: 'Storage key is already set',
  onlyOneAccount: 'Only one account exist in the wallet',
  fullMempool: 'fullMempool',
  submit: 'submit',
};
