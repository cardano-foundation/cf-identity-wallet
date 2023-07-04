import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";

interface MyWalletsProps {
  myWalletsIsOpen: boolean;
  setMyWalletsIsOpen: (value: boolean) => void;
  setAddAccountIsOpen: (value: boolean) => void;
  defaultAccountData: CryptoAccountProps;
  setDefaultAccountData: (value: CryptoAccountProps) => void;
  defaultAccountAddress: string;
  setDefaultAccountAddress: (value: string) => void;
}

export type { MyWalletsProps };
