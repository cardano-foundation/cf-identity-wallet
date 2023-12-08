import BackgroundDid0 from "../assets/images/did-0.png";
import BackgroundDid1 from "../assets/images/did-1.png";
import BackgroundDid2 from "../assets/images/did-2.png";
import BackgroundDid3 from "../assets/images/did-3.png";
import BackgroundKERI0 from "../assets/images/keri-0.png";
import BackgroundKERI1 from "../assets/images/keri-1.png";

enum CardType {
  CREDS = "creds",
  IDENTIFIERS = "identifiers",
}

enum DIDCommRequestType {
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
}

enum ToastMsgType {
  COPIED_TO_CLIPBOARD = "copiedToClipboard",
  IDENTIFIER_CREATED = "identifierCreated",
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
  SCAN_ERROR = "scanError",
  NOTES_UPDATED = "notesUpdated",
  NOTE_REMOVED = "noteRemoved",
  MAX_FAVOURITES_REACHED = "maxFavouritesReached",
}

const IDENTIFIER_BG_MAPPING: Record<number, unknown> = {
  0: BackgroundDid0,
  1: BackgroundDid1,
  2: BackgroundDid2,
  3: BackgroundDid3,
  4: BackgroundKERI0,
  5: BackgroundKERI1,
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

export {
  CardType,
  OperationType,
  ToastMsgType,
  DIDCommRequestType,
  IDENTIFIER_BG_MAPPING,
  PASSCODE_MAPPING,
};
