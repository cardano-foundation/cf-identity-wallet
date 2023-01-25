import {
  enable,
  getAddress,
  getBalance,
  getCollateral,
  getNetworkId,
  getRewardAddress,
  getUtxos,
  isEnabled,
  off,
  on,
  signDataCIP30,
  signTx,
  submitTx,
} from '../webpage';

// CIP-30
window.cardano = {
  ...(window.cardano || {}),
  idwallet: {
    enable: async () => {
      console.log('Is enabled?1111');
      if (await enable()) {
        console.log('Is enabled!');
        return {
          getBalance: () => getBalance(),
          signData: (address, payload) => signDataCIP30(address, payload),
          signTx: (tx, partialSign) => signTx(tx, partialSign),
          submitTx: (tx) => submitTx(tx),
          getUtxos: (amount, paginate) => getUtxos(amount, paginate),
          getUsedAddresses: async () => [await getAddress()],
          getUnusedAddresses: async () => [],
          getChangeAddress: () => getAddress(),
          getRewardAddresses: async () => [await getRewardAddress()],
          getNetworkId: () => getNetworkId(),
          experimental: {
            on: (eventName, callback) => on(eventName, callback),
            off: (eventName, callback) => off(eventName, callback),
            getCollateral: () => getCollateral(),
          },
        };
      }
    },
    isEnabled: () => isEnabled(),
    apiVersion: '0.1.0',
    name: 'IdWallet',
    icon: '',
    _events: {},
  },
};
