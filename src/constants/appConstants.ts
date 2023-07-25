import { CryptoAccountProps } from "../ui/pages/Crypto/Crypto.types";

const MNEMONIC_FIFTEEN_WORDS = 15;
const MNEMONIC_TWENTYFOUR_WORDS = 24;
const FIFTEEN_WORDS_BIT_LENGTH = 160;
const TWENTYFOUR_WORDS_BIT_LENGTH = 256;
const DISPLAY_NAME_LENGTH = 32;
const GENERATE_SEED_PHRASE_STATE = {
  type: {
    onboarding: "onboarding",
    additional: "additional",
    restore: "restore",
    success: "success",
  },
};
const DEFAULT_CREDENTIALS_CARD_DATA = {
  id: "",
  type: [""],
  connection: "",
  issuanceDate: "",
  expirationDate: "",
  receivingDid: "",
  credentialType: "",
  nameOnCredential: "",
  issuerLogo: "",
  credentialSubject: {
    degree: {
      education: "",
      type: "",
      name: "",
    },
  },
  proofType: "",
  proofValue: "",
  credentialStatus: {
    revoked: false,
    suspended: false,
  },
  colors: ["", ""],
};
const DEFAULT_CRYPTO_ACCOUNT_DATA: CryptoAccountProps = {
  address: "",
  name: "",
  blockchain: "",
  currency: "",
  logo: "",
  balance: {
    main: {
      nativeBalance: 0,
      usdBalance: 0,
    },
    reward: {
      nativeBalance: 0,
      usdBalance: 0,
    },
  },
  usesIdentitySeedPhrase: false,
  assets: [],
  transactions: [],
};

export {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
  DISPLAY_NAME_LENGTH,
  GENERATE_SEED_PHRASE_STATE,
  DEFAULT_CREDENTIALS_CARD_DATA,
  DEFAULT_CRYPTO_ACCOUNT_DATA,
};
