import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";

interface MyWalletsProps {
  myWalletsIsOpen: boolean;
  setMyWalletsIsOpen: (value: boolean) => void;
  setAddAccountIsOpen: (value: boolean) => void;
  currentAccount: CryptoAccountProps;
}

export type { MyWalletsProps };
