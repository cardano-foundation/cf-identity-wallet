import { ReactNode, useEffect, useState } from "react";
import {
  BasicMessageStateChangedEvent,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  CredentialExchangeRecord,
  CredentialStateChangedEvent,
} from "@aries-framework/core";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setCurrentOperation,
  setInitialized,
  setPauseQueueConnectionCredentialRequest,
  setQueueConnectionCredentialRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import {
  KeyStoreKeys,
  SecureStorage,
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage";
import {
  setFavouritesIdentifiersCache,
  setIdentifiersCache,
} from "../../../store/reducers/identifiersCache";
import {
  setCredsCache,
  setFavouritesCredsCache,
  updateOrAddCredsCache,
} from "../../../store/reducers/credsCache";
import { AriesAgent } from "../../../core/agent/agent";
import {
  setConnectionsCache,
  updateOrAddConnectionCache,
} from "../../../store/reducers/connectionsCache";
import { ConnectionCredentialRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { OperationType, ToastMsgType } from "../../globals/types";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { ColorGenerator } from "../../utils/colorGenerator";
import {
  KeriNotification,
  ConnectionKeriStateChangedEvent,
  ConnectionStatus,
  AcdcKeriStateChangedEvent,
  ConnectionType,
} from "../../../core/agent/agent.types";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "../../../core/agent/services/credentialService.types";
import { FavouriteIdentifier } from "../../../store/reducers/identifiersCache/identifiersCache.types";

const connectionStateChangedHandler = async (
  event: ConnectionStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const connectionRecord = event.payload.connectionRecord;
  if (AriesAgent.agent.connections.isConnectionRequestSent(connectionRecord)) {
    const connectionDetails =
      AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING));
  } else if (
    AriesAgent.agent.connections.isConnectionResponseReceived(connectionRecord)
  ) {
    const connectionDetails =
      AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
    dispatch(
      setQueueConnectionCredentialRequest({
        id: connectionRecord.id,
        type: ConnectionCredentialRequestType.CONNECTION_RESPONSE,
        logo: connectionDetails.logo,
        label: connectionDetails.label,
      })
    );
  } else if (
    AriesAgent.agent.connections.isConnectionRequestReceived(connectionRecord)
  ) {
    const connectionDetails =
      AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setToastMsg(ToastMsgType.CONNECTION_REQUEST_INCOMING));
    dispatch(
      setQueueConnectionCredentialRequest({
        id: connectionRecord.id,
        type: ConnectionCredentialRequestType.CONNECTION_INCOMING,
        logo: connectionDetails.logo,
        label: connectionDetails.label,
      })
    );
  } else if (
    AriesAgent.agent.connections.isConnectionResponseSent(connectionRecord)
  ) {
    dispatch(setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING));
  } else if (
    AriesAgent.agent.connections.isConnectionConnected(connectionRecord)
  ) {
    const connectionDetails =
      AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setToastMsg(ToastMsgType.NEW_CONNECTION_ADDED));
  }
};

const credentialStateChangedHandler = async (
  event: CredentialStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const credentialRecord = event.payload.credentialRecord;
  if (
    AriesAgent.agent.credentials.isCredentialOfferReceived(credentialRecord)
  ) {
    let connection;
    if (credentialRecord.connectionId) {
      connection =
        await AriesAgent.agent.connections.getConnectionShortDetailById(
          credentialRecord?.connectionId
        );
    }
    dispatch(
      setQueueConnectionCredentialRequest({
        id: credentialRecord.id,
        type: ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: connection?.logo,
        label: connection?.label,
      })
    );
  } else if (
    AriesAgent.agent.credentials.isCredentialRequestSent(credentialRecord)
  ) {
    const credentialDetails: CredentialShortDetails = {
      id: `metadata:${credentialRecord.id}`,
      isArchived: false,
      colors: new ColorGenerator().generateNextColor() as [string, string],
      credentialType: "",
      issuanceDate: credentialRecord.createdAt.toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
      connectionId: credentialRecord.connectionId,
      connectionType: ConnectionType.DIDCOMM,
    };
    await AriesAgent.agent.credentials.createMetadata({
      ...credentialDetails,
      credentialRecordId: credentialRecord.id,
    });
    dispatch(setCurrentOperation(OperationType.ADD_CREDENTIAL));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING));
    dispatch(updateOrAddCredsCache(credentialDetails));
  } else if (AriesAgent.agent.credentials.isCredentialDone(credentialRecord)) {
    const credentialShortDetails =
      await AriesAgent.agent.credentials.updateMetadataCompleted(
        credentialRecord
      );
    dispatch(setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED));
    dispatch(updateOrAddCredsCache(credentialShortDetails));
  }
};

const messageStateChangedHandler = async (
  event: BasicMessageStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const messageRecord = event.payload.basicMessageRecord;
};

const connectionKeriStateChangedHandler = async (
  event: ConnectionKeriStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === ConnectionStatus.PENDING) {
    dispatch(setCurrentOperation(OperationType.RECEIVE_CONNECTION));
    dispatch(setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING));
  } else {
    const connectionRecordId = event.payload.connectionId!;
    const connectionDetails =
      await AriesAgent.agent.connections.getConnectionKeriShortDetailById(
        connectionRecordId
      );
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setToastMsg(ToastMsgType.NEW_CONNECTION_ADDED));
  }
};

const keriNotificationsChangeHandler = async (
  event: KeriNotification,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  dispatch(
    setQueueConnectionCredentialRequest({
      id: event?.id,
      type: ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED,
      logo: "", // TODO: must define Keri logo
      label: "Credential Issuance Server", // TODO: must define it
      source: ConnectionType.KERI,
    })
  );
};

const keriAcdcChangeHandler = async (
  event: AcdcKeriStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === CredentialStatus.PENDING) {
    dispatch(setCurrentOperation(OperationType.ADD_CREDENTIAL));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING));
  } else {
    dispatch(setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED));
    dispatch(setCurrentOperation(OperationType.IDLE));
  }
};
const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const checkKeyStore = async (key: string) => {
    try {
      const itemInKeyStore = await SecureStorage.get(key);
      return !!itemInKeyStore;
    } catch (e) {
      return false;
    }
  };
  const initApp = async () => {
    try {
      const isInitialized = await PreferencesStorage.get(
        PreferencesKeys.APP_ALREADY_INIT
      );
      dispatch(setInitialized(isInitialized?.initialized as boolean));
    } catch (e) {
      // TODO
      await SecureStorage.set(KeyStoreKeys.IDENTITY_ENTROPY, "");
      await SecureStorage.set(KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY, "");
      await SecureStorage.set(KeyStoreKeys.APP_PASSCODE, "");
    }

    await AriesAgent.agent.start();
    dispatch(setPauseQueueConnectionCredentialRequest(true));
    const connectionsDetails =
      await AriesAgent.agent.connections.getConnections();
    const credentials = await AriesAgent.agent.credentials.getCredentials();
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const storedIdentifiers =
      await AriesAgent.agent.identifiers.getIdentifiers();
    // @TODO - sdisalvo: This will need to be updated as soon as we have something to get our stored crypto accounts.

    try {
      const identifiersFavourites = await PreferencesStorage.get(
        PreferencesKeys.APP_IDENTIFIERS_FAVOURITES
      );
      dispatch(
        setFavouritesIdentifiersCache(
          identifiersFavourites.favourites as FavouriteIdentifier[]
        )
      );

      const credsFavourites = await PreferencesStorage.get(
        PreferencesKeys.APP_CREDS_FAVOURITES
      );
      dispatch(
        setFavouritesCredsCache(
          credsFavourites.favourites as FavouriteIdentifier[]
        )
      );
    } catch (e) {
      // @TODO: handle error
    }

    dispatch(
      setAuthentication({
        ...authentication,
        passcodeIsSet,
        seedPhraseIsSet,
        passwordIsSet,
      })
    );

    dispatch(setIdentifiersCache(storedIdentifiers));
    dispatch(setCredsCache(credentials));
    dispatch(setConnectionsCache(connectionsDetails));

    AriesAgent.agent.connections.onConnectionStateChanged((event) => {
      return connectionStateChangedHandler(event, dispatch);
    });
    AriesAgent.agent.credentials.onCredentialStateChanged((event) => {
      return credentialStateChangedHandler(event, dispatch);
    });
    AriesAgent.agent.messages.onBasicMessageStateChanged((event) => {
      return messageStateChangedHandler(event, dispatch);
    });
    AriesAgent.agent.connections.onConnectionKeriStateChanged((event) => {
      return connectionKeriStateChangedHandler(event, dispatch);
    });
    AriesAgent.agent.credentials.onNotificationKeriStateChanged((event) => {
      return keriNotificationsChangeHandler(event, dispatch);
    });
    AriesAgent.agent.credentials.onAcdcKeriStateChanged((event) => {
      return keriAcdcChangeHandler(event, dispatch);
    });
    // pickup messages
    AriesAgent.agent.messages.pickupMessagesFromMediator();
    setInitialised(true);

    const oldMessages = (
      await Promise.all([
        AriesAgent.agent.connections.getUnhandledConnections(),
        AriesAgent.agent.credentials.getUnhandledCredentials(),
      ])
    )
      .flat()
      .sort(function (messageA, messageB) {
        return messageA.createdAt.valueOf() - messageB.createdAt.valueOf();
      });
    oldMessages.forEach(async (message) => {
      if (message instanceof ConnectionRecord) {
        await connectionStateChangedHandler(
          {
            payload: { connectionRecord: message },
          } as unknown as ConnectionStateChangedEvent,
          dispatch
        );
      } else if (message instanceof CredentialExchangeRecord) {
        await credentialStateChangedHandler(
          {
            payload: { credentialRecord: message },
          } as unknown as CredentialStateChangedEvent,
          dispatch
        );
      } else {
        await keriNotificationsChangeHandler(message, dispatch);
      }
    });
  };

  return initialised ? <>{props.children}</> : <></>;
};

export {
  AppWrapper,
  connectionStateChangedHandler,
  credentialStateChangedHandler,
};
