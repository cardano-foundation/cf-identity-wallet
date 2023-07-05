import { CryptoAccountProps } from "../pages/Crypto/Crypto.types";
import CardanoLogo from "../assets/images/CardanoLogo.jpg";

const cryptoAccountsMock: CryptoAccountProps[] = [
  {
    address: "stake1u9f9v0z5zzlldgx58n8tklphu8mf7h4jvp2j2gddluemnssjfnkzz",
    name: "Test wallet 1",
    blockchain: "Cardano",
    currency: "ADA",
    logo: CardanoLogo,
    balance: {
      main: {
        nativeBalance: 3678.05563949,
        usdBalance: 1012.0,
      },
      reward: {
        nativeBalance: 52.8638809,
        usdBalance: 15.45,
      },
    },
    usesIdentitySeedPhrase: false,
  },
  {
    address: "stake1u9eauga0y2das8xvmmptq4kqdzvqjdmc6e357qplyrpatfgu2w47a",
    name: "Test wallet 2",
    blockchain: "Cardano",
    currency: "ADA",
    logo: CardanoLogo,
    balance: {
      main: {
        nativeBalance: 47526.01302044,
        usdBalance: 13000.0,
      },
      reward: {
        nativeBalance: 362.04059792,
        usdBalance: 105.81,
      },
    },
    usesIdentitySeedPhrase: false,
  },
];

export { cryptoAccountsMock };
