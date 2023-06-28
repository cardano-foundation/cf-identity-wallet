import { CryptoAccountProps } from "../pages/Crypto/Crypto.types";
import CardanoLogo from "../assets/images/CardanoLogo.jpg";

const cryptoAccountsMock: CryptoAccountProps[] = [
  {
    name: "Test wallet",
    blockchain: "Cardano",
    currency: "ADA",
    logo: CardanoLogo,
    nativeBalance: 3678.05563949,
    usdBalance: 1012.0,
    usesIdentitySeedPhrase: false,
  },
  {
    name: "Test wallet",
    blockchain: "Cardano",
    currency: "ADA",
    logo: CardanoLogo,
    nativeBalance: 47526.01302044,
    usdBalance: 13000.0,
    usesIdentitySeedPhrase: false,
  },
];

export { cryptoAccountsMock };
