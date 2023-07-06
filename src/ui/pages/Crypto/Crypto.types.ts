interface CryptoAccountProps {
  address: string;
  name: string;
  blockchain: string;
  currency: string;
  logo: string;
  balance: {
    main: {
      nativeBalance: number;
      usdBalance: number;
    };
    reward: {
      nativeBalance: number;
      usdBalance: number;
    };
  };
  usesIdentitySeedPhrase: boolean;
}

export type { CryptoAccountProps };
