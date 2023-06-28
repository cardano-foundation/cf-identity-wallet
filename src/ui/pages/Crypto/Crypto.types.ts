interface CryptoAccountProps {
  name: string;
  blockchain: string;
  currency: string;
  logo: string;
  nativeBalance: number;
  usdBalance: number;
  usesIdentitySeedPhrase?: boolean;
}

export type { CryptoAccountProps };
