interface CryptoBalanceItem {
  title: string;
  fiatBalance: string;
  nativeBalance: string;
}

interface CryptoBalanceProps {
  items: CryptoBalanceItem[];
}

export type { CryptoBalanceItem, CryptoBalanceProps };
