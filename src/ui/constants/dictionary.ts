import {
  ConnectionStatus,
  CredentialDetails,
} from "../../core/agent/agent.types";
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
  restoreCryptoAccount: "restoreCryptoAccount",
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

const blurredCryptoData = "••••••••••••••••••";

const themeBackgroundMapping: Record<number, unknown> = {
  0: BackgroundDidKey0,
  1: BackgroundDidKey1,
  2: BackgroundDidKey2,
  3: BackgroundDidKey3,
  4: BackgroundKERI0,
  5: BackgroundKERI1,
};

const passcodeMapping = {
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  labels: [
    [""],
    ["A B C"],
    ["D E F"],
    ["G H I"],
    ["J K L"],
    ["M N O"],
    ["P Q R S"],
    ["T U V"],
    ["W X Y Z"],
    [""],
  ],
};
export {
  MAX_FAVOURITES,
  CardTypes,
  CredentialType,
  connectionStatus,
  operationState,
  toastState,
  blurredCryptoData,
  connectionType,
  themeBackgroundMapping,
  passcodeMapping,
};
