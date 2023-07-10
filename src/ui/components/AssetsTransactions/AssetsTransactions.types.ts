import {
  CryptoAssetsProps,
  CryptoTransactionsProps,
} from "../../pages/Crypto/Crypto.types";

interface AssetsTransactionsProps {
  assets: CryptoAssetsProps[];
  transactions: CryptoTransactionsProps[];
  expanded: boolean;
  hideBalance: boolean;
}

export type { AssetsTransactionsProps };
