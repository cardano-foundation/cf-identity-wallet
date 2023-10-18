import {
  ConnectionShortDetails,
  ConnectionStatus,
  CredentialDetails,
} from "../../core/agent/agent.types";
import { CryptoAccountProps } from "../pages/Crypto/Crypto.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";

const cardTypes = {
  creds: "creds",
  dids: "dids",
};

const connectionStatus = {
  pending: ConnectionStatus.PENDING,
  confirmed: ConnectionStatus.CONFIRMED,
};

const connectionType = {
  connection: "connection",
  credential: "credential",
};

const operationState = {
  onboarding: "onboarding",
  newCryptoAccount: "newCryptoAccount",
  restoreCryptoAccount: "restoreCryptoAccount",
  createWallet: "createWallet",
  renameWallet: "renameWallet",
  restoreWallet: "restoreWallet",
  deleteWallet: "deleteWallet",
  updateIdentity: "updateIdentity",
  deleteIdentity: "deleteIdentity",
  deleteConnection: "deleteConnection",
  archiveCredential: "archiveCredential",
  restoreCredential: "restoreCredential",
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
  identityUpdated: "identityUpdated",
  identityDeleted: "identityDeleted",
  credentialDeleted: "credentialDeleted",
  credentialRestored: "credentialRestored",
  credentialsDeleted: "credentialsDeleted",
  credentialsRestored: "credentialsRestored",
  credentialArchived: "credentialArchived",
  connectionDeleted: "connectionDeleted",
  qrSuccess: "qrSuccess",
  qrError: "qrError",
  connectionRequestPending: "connectionRequestPending",
  connectionRequestIncoming: "connectionRequestIncoming",
  newConnectionAdded: "newConnectionAdded",
  credentialRequestPending: "credentialRequestPending",
  newCredentialAdded: "newCredentialAdded",
  notesUpdated: "notesUpdated",
  noteRemoved: "noteRemoved",
};

const defaultCredentialsCardData: CredentialDetails = {
  id: "",
  type: [""],
  connectionId: "",
  issuanceDate: "",
  expirationDate: "",
  credentialType: "",
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
  colors: ["", ""],
  status: CredentialMetadataRecordStatus.PENDING,
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

const defaultConnectionData: ConnectionShortDetails = {
  id: "",
  label: "",
  connectionDate: "",
  logo: "",
  status: ConnectionStatus.PENDING,
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
  connectionType,
};
