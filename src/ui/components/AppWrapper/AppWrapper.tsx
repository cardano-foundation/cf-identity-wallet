import { ReactNode, useEffect, useState } from "react";
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
import { CredentialMetadataRecordStatus } from "../../../core/agent/records/credentialMetadataRecord.types";
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
import { ConfigurationService } from "../../../core/configuration";
import { PreferencesStorageItem } from "../../../core/storage/preferences/preferencesStorage.type";

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
    const multisigIcpDetails =
      await AriesAgent.agent.identifiers.getMultisigIcpDetails(event);
    dispatch(
      setQueueIncomingRequest({
        id: event?.id,
        event: event,
        type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
        source: ConnectionType.KERI,
        multisigIcpDetails: multisigIcpDetails,
      })
    );
  } else if (event?.a?.r === NotificationRoute.MultiSigRot) {
    //TODO: Use dispatch here, handle logic for the multisig rotation notification
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
  const [isOffline, setIsOffline] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (!isOffline && initialised) {
      const handleMessages = async () => {
        AriesAgent.agent.connections.onConnectionKeriStateChanged((event) => {
          return connectionKeriStateChangedHandler(event, dispatch);
        });
        AriesAgent.agent.signifyNotifications.onNotificationKeriStateChanged(
          (event) => {
            return keriNotificationsChangeHandler(event, dispatch);
          }
        );
        AriesAgent.agent.credentials.onAcdcKeriStateChanged((event) => {
          return keriAcdcChangeHandler(event, dispatch);
        });

        const oldMessages = (
          await Promise.all([
            AriesAgent.agent.credentials.getKeriCredentialNotifications(),
            AriesAgent.agent.identifiers.getUnhandledMultisigIdentifiers({
              isDismissed: false,
            }),
          ])
        )
          .flat()
          .sort(function (messageA, messageB) {
            return messageA.createdAt.valueOf() - messageB.createdAt.valueOf();
          });
        oldMessages.forEach(async (message) => {
          await keriNotificationsChangeHandler(message, dispatch);
        });
        // Fetch and sync the identifiers, contacts and ACDCs from KERIA to our storage
        //TODO: uncomment these lines when we finish the KERIA refactoring
        // await Promise.all([
        //   AriesAgent.agent.identifiers.syncKeriaIdentifiers(),
        //   AriesAgent.agent.connections.syncKeriaContacts(),
        //   AriesAgent.agent.credentials.syncACDCs(),
        // ]);
      };
      handleMessages();
    }
  }, [isOffline, initialised]);

  const checkKeyStore = async (key: string) => {
    try {
      const itemInKeyStore = await SecureStorage.get(key);
      return !!itemInKeyStore;
    } catch (e) {
      return false;
    }
  };

  const initApp = async () => {
    // @TODO - foconnor: This is a temp hack for development to be removed pre-release.
    // These items are removed from the secure storage on re-install to re-test the on-boarding for iOS devices.
    try {
      const isInitialized = await PreferencesStorage.get(
        PreferencesKeys.APP_ALREADY_INIT
      );
      dispatch(setInitialized(isInitialized?.initialized as boolean));
    } catch (e) {
      await SecureStorage.delete(KeyStoreKeys.APP_PASSCODE);
      await SecureStorage.delete(KeyStoreKeys.IDENTITY_ENTROPY);
      await SecureStorage.delete(KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY);
      await SecureStorage.delete(KeyStoreKeys.APP_OP_PASSWORD);
      await SecureStorage.delete(KeyStoreKeys.SIGNIFY_BRAN);
    }

    await new ConfigurationService().start();

    try {
      await AriesAgent.agent.start();
      setIsOffline(false);
    } catch (e) {
      const errorStack = (e as Error).stack as string;
      // If the error is failed to fetch with signify, we retry until the connection is secured
      if (/SignifyClient/gi.test(errorStack)) {
        AriesAgent.agent.bootAndConnect().then(() => {
          setIsOffline(!AriesAgent.agent.isAgentReady());
        });
      } else {
        throw e;
      }
    }

    dispatch(setPauseQueueIncomingRequest(true));
    const connectionsDetails =
      await AriesAgent.agent.connections.getConnections();
    let userName: PreferencesStorageItem = { userName: "" };
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

    try {
      userName = await PreferencesStorage.get(PreferencesKeys.APP_USER_NAME);
    } catch (e) {
      if (
        !(e instanceof Error) ||
        !(
          e instanceof Error &&
          e.message ===
            `${PreferencesStorage.KEY_NOT_FOUND} ${PreferencesKeys.APP_USER_NAME}`
        )
      ) {
        throw e;
      }
    }

    dispatch(
      setAuthentication({
        ...authentication,
        userName: userName.userName as string,
        passcodeIsSet,
        seedPhraseIsSet,
        passwordIsSet,
      })
    );

    dispatch(setIdentifiersCache(storedIdentifiers));
    dispatch(setCredsCache(credentials));
    dispatch(setConnectionsCache(connectionsDetails));

    setInitialised(true);
  };

  return initialised ? <>{props.children}</> : <></>;
};

export { AppWrapper };
