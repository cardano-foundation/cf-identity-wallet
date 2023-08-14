import { ConnectionsProps } from "../pages/Connections/Connections.types";
import { CryptoAccountProps } from "../pages/Crypto/Crypto.types";

const cardTypes = {
  creds: "creds",
  dids: "dids",
};

const connectionStatus = {
  pending: "pending",
  status: "confirmed",
};

const generateSeedPhraseState = {
  onboarding: "onboarding",
  additional: "additional",
  restore: "restore",
  success: "success",
};

const defaultCredentialsCardData = {
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

const defaultCryptoAccountData: CryptoAccountProps = {
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

const defaultConnectionData: ConnectionsProps = {
  id: "",
  issuer: "",
  issuanceDate: "",
  issuerLogo: "",
  status: "",
};

export {
  cardTypes,
  connectionStatus,
  generateSeedPhraseState,
  defaultCredentialsCardData,
  defaultCryptoAccountData,
  defaultConnectionData,
};
