import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";

interface CryptoReceiveAddressProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  accountData: CryptoAccountProps;
}

export type { CryptoReceiveAddressProps };
