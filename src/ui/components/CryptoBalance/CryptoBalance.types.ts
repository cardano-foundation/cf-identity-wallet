interface CryptoBalanceItem {
  title: string;
  fiatBalance: string;
  nativeBalance: string;
}

interface CryptoBalanceProps {
  items: CryptoBalanceItem[];
  hideBalance: boolean;
  setHideBalance: (value: boolean) => void;
}

export type { CryptoBalanceItem, CryptoBalanceProps };
