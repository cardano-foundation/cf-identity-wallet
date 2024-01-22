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
  setPauseQueueIncomingRequest,
  setQueueIncomingRequest,
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
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
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
import { NotificationRoute } from "../../../core/agent/modules/signify/signifyApi.types";
import "./AppWrapper.scss";

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
      setQueueIncomingRequest({
        id: connectionRecord.id,
        type: IncomingRequestType.CONNECTION_RESPONSE,
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
      setQueueIncomingRequest({
        id: connectionRecord.id,
        type: IncomingRequestType.CONNECTION_INCOMING,
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
      setQueueIncomingRequest({
        id: credentialRecord.id,
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
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
      connectionType: ConnectionType.DIDCOMM,
    };
    await AriesAgent.agent.credentials.createMetadata({
      ...credentialDetails,
      credentialRecordId: credentialRecord.id,
      connectionId: credentialRecord.connectionId,
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
  if (event?.a?.r === NotificationRoute.Credential) {
    dispatch(
      setQueueIncomingRequest({
        id: event?.id,
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "", // TODO: must define Keri logo
        label: "Credential Issuance Server", // TODO: must define it
        source: ConnectionType.KERI,
      })
    );
  } else if (event?.a?.r === NotificationRoute.MultiSigIcp) {
    //TODO: Use dispatch here, handle logic for the multisig notification
  }
};

const keriAcdcChangeHandler = async (
  event: AcdcKeriStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === CredentialStatus.PENDING) {
    dispatch(setCurrentOperation(OperationType.ADD_CREDENTIAL));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING));
  } else {
    dispatch(updateOrAddCredsCache(event.payload.credential));
    dispatch(setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED));
    dispatch(setCurrentOperation(OperationType.IDLE));
  }
};

const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [initialised, setInitialised] = useState(false);
  const [agentInitErr, setAgentInitErr] = useState(false);

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

    try {
      await AriesAgent.agent.start();
    } catch (e) {
      // @TODO - foconnor: Should specifically catch the error instead of all, but OK for now.
      setAgentInitErr(true);
      // eslint-disable-next-line no-console
      console.error(e);
      return;
    }

    dispatch(setPauseQueueIncomingRequest(true));
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

    // @TODO - handle error
    try {
      const identifiersFavourites = await PreferencesStorage.get(
        PreferencesKeys.APP_IDENTIFIERS_FAVOURITES
      );
      dispatch(
        setFavouritesIdentifiersCache(
          identifiersFavourites.favourites as FavouriteIdentifier[]
        )
      );
    } catch (e) {
      if (
        !(e instanceof Error) ||
        !(
          e instanceof Error &&
          e.message ===
            `${PreferencesStorage.KEY_NOT_FOUND} ${PreferencesKeys.APP_IDENTIFIERS_FAVOURITES}`
        )
      ) {
        throw e;
      }
    }

    try {
      const credsFavourites = await PreferencesStorage.get(
        PreferencesKeys.APP_CREDS_FAVOURITES
      );
      dispatch(
        setFavouritesCredsCache(
          credsFavourites.favourites as FavouriteIdentifier[]
        )
      );
    } catch (e) {
      if (
        !(e instanceof Error) ||
        !(
          e instanceof Error &&
          e.message ===
            `${PreferencesStorage.KEY_NOT_FOUND} ${PreferencesKeys.APP_CREDS_FAVOURITES}`
        )
      ) {
        throw e;
      }
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
    AriesAgent.agent.signifyNotification.onNotificationKeriStateChanged(
      (event) => {
        return keriNotificationsChangeHandler(event, dispatch);
      }
    );
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
    // Fetch and sync the identifiers, contacts and ACDCs from KERIA to our storage
    await Promise.all([
      AriesAgent.agent.identifiers.syncKeriaIdentifiers(),
      AriesAgent.agent.connections.syncKeriaContacts(),
      AriesAgent.agent.credentials.syncACDCs(),
    ]);
  };

  // @TODO - foconnor: We should allow the app to load and give more accurate feedback - this is a temp solution.
  // Hence this isn't in i18n.
  if (agentInitErr) {
    return (
      <div className="agent-init-error-msg">
        <p>
          There’s an issue connecting to the cloud services we depend on right
          now (DIDComm mediator, KERIA) - please check your internet connection,
          or if this problem persists, let us know on Discord!
        </p>
        <p>
          We’re working on an offline mode, as well as improving the deployment
          setup for this pre-production release. Thank you for your
          understanding!
        </p>
      </div>
    );
  }

  return initialised ? <>{props.children}</> : <></>;
};

export {
  AppWrapper,
  connectionStateChangedHandler,
  credentialStateChangedHandler,
};
