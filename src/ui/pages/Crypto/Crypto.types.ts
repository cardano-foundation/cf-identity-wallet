interface CryptoAssetsProps {
  name: string;
  balance: number;
  logo: string;
  currentPrice: number;
  performance: number;
}

interface CryptoTransactionsProps {
  address: string;
  type: string[];
  operation: string;
  timestamp: string;
  amount: number;
  currency: string;
  status: string;
}

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
  assets: CryptoAssetsProps[];
  transactions: CryptoTransactionsProps[];
}

export type { CryptoAccountProps, CryptoAssetsProps, CryptoTransactionsProps };
