import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  logout,
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
import { Agent } from "../../../core/agent/agent";
import {
  setConnectionsCache,
  updateOrAddConnectionCache,
} from "../../../store/reducers/connectionsCache";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { OperationType, ToastMsgType } from "../../globals/types";
import {
  KeriaNotification,
  ConnectionStateChangedEvent,
  ConnectionStatus,
  AcdcStateChangedEvent,
  NotificationRoute,
} from "../../../core/agent/agent.types";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import { FavouriteIdentifier } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import "./AppWrapper.scss";
import { ConfigurationService } from "../../../core/configuration";

const connectionStateChangedHandler = async (
  event: ConnectionStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === ConnectionStatus.PENDING) {
    dispatch(setCurrentOperation(OperationType.RECEIVE_CONNECTION));
    dispatch(setToastMsg(ToastMsgType.CONNECTION_REQUEST_PENDING));
  } else {
    const connectionRecordId = event.payload.connectionId!;
    const connectionDetails =
      await Agent.agent.connections.getConnectionShortDetailById(
        connectionRecordId
      );
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setToastMsg(ToastMsgType.NEW_CONNECTION_ADDED));
  }
};

const keriaNotificationsChangeHandler = async (
  event: KeriaNotification,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event?.a?.r === NotificationRoute.Credential) {
    dispatch(
      setQueueIncomingRequest({
        id: event?.id,
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "", // TODO: must define Keri logo
        label: "Credential Issuance Server", // TODO: must define it
      })
    );
  } else if (event?.a?.r === NotificationRoute.MultiSigIcp) {
    const multisigIcpDetails =
      await Agent.agent.multiSigs.getMultisigIcpDetails(event);
    dispatch(
      setQueueIncomingRequest({
        id: event?.id,
        event: event,
        type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
        multisigIcpDetails: multisigIcpDetails,
      })
    );
  } else if (event?.a?.r === NotificationRoute.MultiSigRot) {
    //TODO: Use dispatch here, handle logic for the multisig rotation notification
  }
};

const acdcChangeHandler = async (
  event: AcdcStateChangedEvent,
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
  const [isOnline, setIsOnline] = useState(false);

  const ACTIVITY_TIMEOUT = 60000;
  let timer: NodeJS.Timeout;

  useEffect(() => {
    const handleActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        dispatch(logout());
      }, ACTIVITY_TIMEOUT);
    };

    // TODO: detect appStateChange in android and ios to reduce the ACTIVITY_TIMEOUT
    // App.addListener("appStateChange", handleAppStateChange);
    window.addEventListener("load", handleActivity);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("touchstart", handleActivity);
    document.addEventListener("touchmove", handleActivity);
    document.addEventListener("click", handleActivity);
    document.addEventListener("focus", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("load", handleActivity);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("touchmove", handleActivity);
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("focus", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (authentication.loggedIn) {
      dispatch(setPauseQueueIncomingRequest(!isOnline));
    } else {
      dispatch(setPauseQueueIncomingRequest(true));
    }
    if (isOnline) {
      const handleMessages = async () => {
        Agent.agent.connections.onConnectionStateChanged((event) => {
          return connectionStateChangedHandler(event, dispatch);
        });
        Agent.agent.signifyNotifications.onNotificationStateChanged((event) => {
          return keriaNotificationsChangeHandler(event, dispatch);
        });
        Agent.agent.credentials.onAcdcStateChanged((event) => {
          return acdcChangeHandler(event, dispatch);
        });

        const oldMessages = (
          await Promise.all([
            Agent.agent.credentials.getUnhandledIpexGrantNotifications({
              isDismissed: false,
            }),
            Agent.agent.multiSigs.getUnhandledMultisigIdentifiers({
              isDismissed: false,
            }),
          ])
        )
          .flat()
          .sort(function (messageA, messageB) {
            return messageA.createdAt.valueOf() - messageB.createdAt.valueOf();
          });
        oldMessages.forEach(async (message) => {
          await keriaNotificationsChangeHandler(message, dispatch);
        });
        // Fetch and sync the identifiers, contacts and ACDCs from KERIA to our storage
        // await Promise.all([
        //   Agent.agent.identifiers.syncKeriaIdentifiers(),
        //   Agent.agent.connections.syncKeriaContacts(),
        //   Agent.agent.credentials.syncACDCs(),
        // ]);
      };
      handleMessages();
    }
  }, [isOnline, authentication.loggedIn, dispatch]);

  const checkKeyStore = async (key: string) => {
    try {
      const itemInKeyStore = await SecureStorage.get(key);
      return !!itemInKeyStore;
    } catch (e) {
      return false;
    }
  };

  const loadDatabase = async () => {
    const connectionsDetails = await Agent.agent.connections.getConnections();

    const credentials = await Agent.agent.credentials.getCredentials();
    const storedIdentifiers = await Agent.agent.identifiers.getIdentifiers();

    dispatch(setIdentifiersCache(storedIdentifiers));
    dispatch(setCredsCache(credentials));
    dispatch(setConnectionsCache(connectionsDetails));
  };

  const loadPreferences = async () => {
    const getPreferenceSafe = async (key: string) => {
      try {
        return await PreferencesStorage.get(key);
      } catch (e) {
        // TODO: handle error
      }
    };
    const userName = await getPreferenceSafe(PreferencesKeys.APP_USER_NAME);

    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);

    const updatedAuthentication = {
      ...authentication,
      loggedIn: false,
      userName: userName?.userName as string,
      passcodeIsSet,
      seedPhraseIsSet,
      passwordIsSet,
    };

    dispatch(setAuthentication(updatedAuthentication));

    const identifiersFavourites = await getPreferenceSafe(
      PreferencesKeys.APP_IDENTIFIERS_FAVOURITES
    );
    dispatch(
      setFavouritesIdentifiersCache(
        identifiersFavourites?.favourites as FavouriteIdentifier[]
      )
    );

    const credsFavourites = await getPreferenceSafe(
      PreferencesKeys.APP_CREDS_FAVOURITES
    );
    dispatch(
      setFavouritesCredsCache(
        credsFavourites?.favourites as FavouriteIdentifier[]
      )
    );
  };

  const initApp = async () => {
    // @TODO - foconnor: This is a temp hack for development to be removed pre-release.
    // These items are removed from the secure storage on re-install to re-test the on-boarding for iOS devices.
    let isInitialized;
    try {
      isInitialized = await PreferencesStorage.get(
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

    await loadPreferences();

    await new ConfigurationService().start();

    try {
      await Agent.agent.start();
      setIsOnline(true);
      await loadDatabase();
    } catch (e) {
      const errorStack = (e as Error).stack as string;
      // If the error is failed to fetch with signify, we retry until the connection is secured
      if (/SignifyClient/gi.test(errorStack)) {
        await loadDatabase();
        Agent.agent.bootAndConnect().then(() => {
          setIsOnline(Agent.agent.getKeriaOnlineStatus());
        });
      } else {
        throw e;
      }
    }
  };

  return <>{props.children}</>;
};

export {
  AppWrapper,
  connectionStateChangedHandler,
  acdcChangeHandler,
  keriaNotificationsChangeHandler,
};
