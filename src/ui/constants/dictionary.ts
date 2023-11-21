import {
  ConnectionShortDetails,
  ConnectionStatus,
  ConnectionType,
  CredentialDetails,
} from "../../core/agent/agent.types";
import { CryptoAccountProps } from "../pages/Crypto/Crypto.types";
import { CredentialMetadataRecordStatus } from "../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import BackgroundDidKey0 from "../assets/images/did-key-0.png";
import BackgroundDidKey1 from "../assets/images/did-key-1.png";
import BackgroundDidKey2 from "../assets/images/did-key-2.png";
import BackgroundDidKey3 from "../assets/images/did-key-3.png";
import BackgroundKERI0 from "../assets/images/keri-0.png";
import BackgroundKERI1 from "../assets/images/keri-1.png";

const MAX_FAVOURITES = 5;

enum CardTypes {
  CREDS = "creds",
  DIDS = "dids",
}

enum CredentialType {
  UNIVERSITY_DEGREE_CREDENTIAL = "UniversityDegreeCredential",
  ACCESS_PASS_CREDENTIAL = "AccessPassCredential",
  PERMANENT_RESIDENT_CARD = "PermanentResidentCard",
}

const connectionStatus = {
  pending: ConnectionStatus.PENDING,
  confirmed: ConnectionStatus.CONFIRMED,
};

const connectionType = {
  connection: "Connection",
  credential: "Credential",
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
  maxFavouritesReached: "maxFavouritesReached",
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
  connectionType: ConnectionType.DIDCOMM,
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

const MAPPING_THEME_BACKGROUND: Record<number, unknown> = {
  0: BackgroundDidKey0,
  1: BackgroundDidKey1,
  2: BackgroundDidKey2,
  3: BackgroundDidKey3,
  4: BackgroundKERI0,
  5: BackgroundKERI1,
};

export {
  MAX_FAVOURITES,
  CardTypes,
  CredentialType,
  connectionStatus,
  operationState,
  toastState,
  defaultCredentialsCardData,
  defaultCryptoAccountData,
  defaultConnectionData,
  blurredCryptoData,
  onboardingRoute,
  connectionType,
  MAPPING_THEME_BACKGROUND,
};
