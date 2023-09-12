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

const operationState = {
  onboarding: "onboarding",
  newCryptoAccount: "newCryptoAccount",
  restoreCryptoAccount: "restoreCryptoAccount",
  createWallet: "createWallet",
  renameWallet: "renameWallet",
  restoreWallet: "restoreWallet",
  deleteWallet: "deleteWallet",
  renameIdentity: "renameIdentity",
  deleteIdentity: "deleteIdentity",
  deleteConnection: "deleteConnection",
  deleteCredential: "deleteCredential",
  scanConnection: "scanConnection",
};

const toastState = {
  copiedToClipboard: "copiedToClipboard",
  walletCreated: "walletCreated",
  walletRenamed: "walletRenamed",
  walletRestored: "walletRestored",
  walletDeleted: "walletDeleted",
  identityCreated: "identityCreated",
  identityRenamed: "identityRenamed",
  identityDeleted: "identityDeleted",
  credentialDeleted: "credentialDeleted",
  connectionDeleted: "connectionDeleted",
  qrSuccess: "qrSuccess",
  qrError: "qrError",
  connectionRequestPending: "connectionRequestPending",
  newConnectionAdded: "newConnectionAdded",
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
  derivationPath: "",
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

const blurredCryptoData = "••••••••••••••••••";

const onboardingRoute = {
  create: "onboardingcreate",
  createRoute: "?route=onboardingcreate",
  restore: "onboardingrestore",
  restoreRoute: "?route=onboardingrestore",
};

export {
  cardTypes,
  connectionStatus,
  operationState,
  toastState,
  defaultCredentialsCardData,
  defaultCryptoAccountData,
  defaultConnectionData,
  blurredCryptoData,
  onboardingRoute,
};
