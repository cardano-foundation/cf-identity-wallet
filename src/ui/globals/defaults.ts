import { CryptoAccountProps } from "../pages/Crypto/Crypto.types";

const DEFAULT_CRYPTO_ACCOUNT_DATA: CryptoAccountProps = {
  address: "",
  derivationPath: "",
  name: "",
  blockchain: "",
  currency: "",
  logo: "",
  balance: {
    main: {
      nativeBalance: 0,
      usdBalance: 0,
    },
    reward: {
      nativeBalance: 0,
      usdBalance: 0,
    },
  },
  usesIdentitySeedPhrase: false,
  assets: [],
  transactions: [],
};

export { DEFAULT_CRYPTO_ACCOUNT_DATA };
