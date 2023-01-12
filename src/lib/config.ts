/**
 * Testnet Network
 */
export const TESTNET_NETWORK_INDEX = '0';
export const MAINNET_NETWORK_INDEX = '1';

export const GLOBAL_TAG = 'Global🌍';

export const numbers = {
  HardDerivationStart: 2147483648,
  Bip44DerivationLevels: {
    Root: 0,
    Purpose: 1,
    CoinType: 2,
    Account: 3,
    Chain: 4,
    Address: 5,
  },
  ChainDerivations: {
    External: 0,
    Internal: 1,
    ChimericAccount: 2,
  },
  CoinTypes: {
    Cardano: 2147485463, // HARD_DERIVATION_START + 1815;
  },
  StakingKeyIndex: 0,
};

export const TX = {
  invalid_hereafter: 3600 * 2, //2h from current slot
  invalid_hereafter_for_nft: 1800 * 2, // 1h from current slot
};

export const DERIVE_PUROPOSE = 1852;
export const DERIVE_COIN_TYPE = 1815;

export const TOTAL_ADDRESS_INDEX = 100;
