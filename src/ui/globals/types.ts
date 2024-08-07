import BackgroundKERI0 from "../assets/images/keri-00.svg";
import BackgroundKERI01 from "../assets/images/keri-01.svg";
import BackgroundKERI02 from "../assets/images/keri-02.svg";
import BackgroundKERI03 from "../assets/images/keri-03.svg";
import BackgroundKERI10 from "../assets/images/keri-10.svg";
import BackgroundKERI11 from "../assets/images/keri-11.svg";
import BackgroundKERI12 from "../assets/images/keri-12.svg";
import BackgroundKERI13 from "../assets/images/keri-13.svg";
import BackgroundKERI20 from "../assets/images/keri-20.svg";
import BackgroundKERI21 from "../assets/images/keri-21.svg";
import BackgroundKERI22 from "../assets/images/keri-22.svg";
import BackgroundKERI23 from "../assets/images/keri-23.svg";
import BackgroundKERI30 from "../assets/images/keri-30.svg";
import BackgroundKERI31 from "../assets/images/keri-31.svg";
import BackgroundKERI32 from "../assets/images/keri-32.svg";
import BackgroundKERI33 from "../assets/images/keri-33.svg";
import BackgroundKERI40 from "../assets/images/keri-40.svg";
import BackgroundKERI41 from "../assets/images/keri-41.svg";
import BackgroundKERI42 from "../assets/images/keri-42.svg";
import BackgroundKERI43 from "../assets/images/keri-43.svg";
import BackgroundRAREVO from "../assets/images/rare-evo-bg.jpg";

enum CardType {
  CREDENTIALS = "credentials",
  IDENTIFIERS = "identifiers",
}

enum RequestType {
  CONNECTION = "Connection",
  CREDENTIAL = "Credential",
}

// String enums as some of these map to i18n values (if relevant)
enum OperationType {
  IDLE = "idle",
  UPDATE_IDENTIFIER = "updateIdentifier",
  DELETE_IDENTIFIER = "deleteIdentifier",
  DELETE_CONNECTION = "deleteConnection",
  ARCHIVE_CREDENTIAL = "archiveCredential",
  DELETE_CREDENTIAL = "deleteCredential",
  SCAN_CONNECTION = "scanConnection",
  ADD_CREDENTIAL = "addCredential",
  RECEIVE_CONNECTION = "receiveConnection",
  MULTI_SIG_INITIATOR_SCAN = "multiSigInitiatorScan",
  MULTI_SIG_RECEIVER_SCAN = "multiSigReceiverScan",
  MULTI_SIG_INITIATOR_INIT = "multiSigInitiatorInit",
  CREATE_IDENTIFIER_CONNECT_WALLET = "createIdentifierConnectWallet",
  CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_IDENTIFIERS = "createIdentifierShareConnectionFromIdentifiers",
  CREATE_IDENTIFIER_SHARE_CONNECTION_FROM_CREDENTIALS = "createIdentifierShareConnectionFromCredentials",
  BACK_TO_CONNECT_WALLET = "backToConnectWallet",
  BACK_TO_SHARE_CONNECTION = "backToShareConnection",
  SCAN_WALLET_CONNECTION = "scanWalletConnection",
  SCAN_SSI_BOOT_URL = "scanSSIBootUrl",
  SCAN_SSI_CONNECT_URL = "scanSSIConnectUrl",
  OPEN_WALLET_CONNECTION_DETAIL = "openWalletConnection",
}

enum ToastMsgType {
  COPIED_TO_CLIPBOARD = "copiedToClipboard",
  IDENTIFIER_REQUESTED = "identifierRequested",
  IDENTIFIER_CREATED = "identifierCreated",
  MULTI_SIGN_IDENTIFIER_CREATED = "multiSignIdentifierCreated",
  DELEGATED_IDENTIFIER_CREATED = "delegatedidentifiercreated",
  IDENTIFIER_UPDATED = "identifierUpdated",
  IDENTIFIER_DELETED = "identifierDeleted",
  CREDENTIAL_DELETED = "credentialDeleted",
  CREDENTIAL_RESTORED = "credentialRestored",
  CREDENTIALS_DELETED = "credentialsDeleted",
  CREDENTIALS_RESTORED = "credentialsRestored",
  CREDENTIAL_ARCHIVED = "credentialArchived",
  CONNECTION_DELETED = "connectionDeleted",
  CONNECTION_REQUEST_PENDING = "connectionRequestPending",
  CONNECTION_REQUEST_INCOMING = "connectionRequestIncoming",
  NEW_CONNECTION_ADDED = "newConnectionAdded",
  CREDENTIAL_REQUEST_PENDING = "credentialRequestPending",
  NEW_CREDENTIAL_ADDED = "newCredentialAdded",
  NOTES_UPDATED = "notesUpdated",
  NOTE_REMOVED = "noteRemoved",
  MAX_FAVOURITES_REACHED = "maxFavouritesReached",
  USERNAME_CREATION_SUCCESS = "usernameCreationSuccess",
  USERNAME_CREATION_ERROR = "usernameCreationError",
  WALLET_CONNECTION_DELETED = "walletconnectiondeleted",
  CONNECT_WALLET_SUCCESS = "connectwalletsuccess",
  DISCONNECT_WALLET_SUCCESS = "disconnectwallet",
  UNABLE_CONNECT_WALLET = "unableconnectwallet",
  PEER_ID_SUCCESS = "peeridsuccess",
  PEER_ID_ERROR = "peeriderror",
  PEER_ID_NOT_RECOGNISED = "peeridnotrecognised",
  SETUP_BIOMETRIC_AUTHENTICATION_SUCCESS = "setupbiometricsuccess",
  ROTATE_KEY_SUCCESS = "rotatekeysuccess",
  ROTATE_KEY_ERROR = "rotatekeyerror",
  SCANNER_ERROR = "qrerror",
  NEW_MULTI_SIGN_MEMBER = "newmultisignmember",
  PASSCODE_UPDATED = "passcodeupdated",
  PASSWORD_UPDATED = "passwordupdated",
  PASSWORD_DISABLED = "passworddisabled",
  PASSWORD_CREATED = "passwordcreated",
  SHARE_CRED_SUCCESS = "sharecredsuccess",
  SHARE_CRED_FAIL = "sharecrederror",
}

const IDENTIFIER_BG_MAPPING: Record<number, unknown> = {
  0: BackgroundKERI0,
  1: BackgroundKERI01,
  2: BackgroundKERI02,
  3: BackgroundKERI03,
  10: BackgroundKERI10,
  11: BackgroundKERI11,
  12: BackgroundKERI12,
  13: BackgroundKERI13,
  20: BackgroundKERI20,
  21: BackgroundKERI21,
  22: BackgroundKERI22,
  23: BackgroundKERI23,
  30: BackgroundKERI30,
  31: BackgroundKERI31,
  32: BackgroundKERI32,
  33: BackgroundKERI33,
  40: BackgroundKERI40,
  41: BackgroundKERI41,
  42: BackgroundKERI42,
  43: BackgroundKERI43,
};

const CREDENTIAL_BG = {
  KERI: BackgroundKERI0,
  RARE: BackgroundRAREVO,
};

const PASSCODE_MAPPING = {
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

enum BackEventPriorityType {
  LockPage = 1001,
  Alert = 1000,
  Modal = 500,
  Scanner = 103,
  Page = 102,
  Tab = 101,
}

export {
  CardType,
  OperationType,
  ToastMsgType,
  RequestType,
  BackEventPriorityType,
  IDENTIFIER_BG_MAPPING,
  PASSCODE_MAPPING,
  CREDENTIAL_BG,
};
