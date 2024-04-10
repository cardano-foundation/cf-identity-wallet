import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  logout,
  setAuthentication,
  setCurrentOperation,
  setCurrentRoute,
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
  KeriNotification,
  ConnectionKeriStateChangedEvent,
  ConnectionStatus,
  AcdcKeriStateChangedEvent,
} from "../../../core/agent/agent.types";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import { FavouriteIdentifier } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import { NotificationRoute } from "../../../core/agent/modules/signify/signifyApi.types";
import "./AppWrapper.scss";
import { ConfigurationService } from "../../../core/configuration";
import { PreferencesStorageItem } from "../../../core/storage/preferences/preferencesStorage.type";
import { RoutePath } from "../../../routes";

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
      await Agent.agent.connections.getConnectionKeriShortDetailById(
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
      })
    );
  } else if (event?.a?.r === NotificationRoute.MultiSigIcp) {
    const multisigIcpDetails =
      await Agent.agent.identifiers.getMultisigIcpDetails(event);
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
const ACTIVTY_TIMEOUT = 14000;
const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [initialised, setInitialised] = useState(false);
  const [agentInitErr, setAgentInitErr] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        dispatch(logout());
      }, ACTIVTY_TIMEOUT);
    };

    window.addEventListener("load", handleActivity);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("touchstart", handleActivity);
    document.addEventListener("touchmove", handleActivity);
    document.addEventListener("click", handleActivity);
    document.addEventListener("focus", handleActivity);
    document.addEventListener("keydown", handleActivity);
    document.addEventListener("scroll", handleActivity);

    handleActivity();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", handleActivity);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("touchmove", handleActivity);
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("focus", handleActivity);
      document.removeEventListener("keydown", handleActivity);
      document.removeEventListener("scroll", handleActivity);
    };
  }, []);

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
      await Agent.agent.start();
    } catch (e) {
      // @TODO - foconnor: Should specifically catch the error instead of all, but OK for now.
      setAgentInitErr(true);
      // eslint-disable-next-line no-console
      console.error(e);
      return;
    }

    dispatch(setPauseQueueIncomingRequest(true));
    const connectionsDetails = await Agent.agent.connections.getConnections();
    let userName: PreferencesStorageItem = { userName: "" };
    const credentials = await Agent.agent.credentials.getCredentials();
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const storedIdentifiers = await Agent.agent.identifiers.getIdentifiers();

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

    Agent.agent.connections.onConnectionKeriStateChanged((event) => {
      return connectionKeriStateChangedHandler(event, dispatch);
    });
    Agent.agent.signifyNotifications.onNotificationKeriStateChanged((event) => {
      return keriNotificationsChangeHandler(event, dispatch);
    });
    Agent.agent.credentials.onAcdcKeriStateChanged((event) => {
      return keriAcdcChangeHandler(event, dispatch);
    });

    setInitialised(true);

    const oldMessages = (
      await Promise.all([
        Agent.agent.credentials.getKeriCredentialNotifications(),
        Agent.agent.identifiers.getUnhandledMultisigIdentifiers({
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
    // await Promise.all([
    //   AriesAgent.agent.identifiers.syncKeriaIdentifiers(),
    //   AriesAgent.agent.connections.syncKeriaContacts(),
    //   AriesAgent.agent.credentials.syncACDCs(),
    // ]);
  };

  // @TODO - foconnor: We should allow the app to load and give more accurate feedback - this is a temp solution.
  // Hence this isn't in i18n.
  if (agentInitErr) {
    return (
      <div className="agent-init-error-msg">
        <p>
          There’s an issue connecting to the cloud services we depend on right
          now (KERIA) - please check your internet connection, or if this
          problem persists, let us know on Discord!
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

export { AppWrapper };
