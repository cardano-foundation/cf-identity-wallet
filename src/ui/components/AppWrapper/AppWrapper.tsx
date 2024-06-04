import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getCurrentOperation,
  setAuthentication,
  setCurrentOperation,
  setInitialized,
  setPauseQueueIncomingRequest,
  setQueueIncomingRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
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
  MiscRecordId,
} from "../../../core/agent/agent.types";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import { FavouriteIdentifier } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import "./AppWrapper.scss";
import { ConfigurationService } from "../../../core/configuration";
import { useActivityTimer } from "./hooks/useActivityTimer";
import { setWalletConnectionsCache } from "../../../store/reducers/walletConnectionsCache";
import { walletConnectionsFix } from "../../__fixtures__/walletConnectionsFix";
import { PeerConnection } from "../../../core/cardano/walletConnect/peerConnection";
import { PeerConnectSigningEvent } from "../../../core/cardano/walletConnect/peerConnection.types";
import { MultiSigService } from "../../../core/agent/services/multiSigService";
import { setViewTypeCache } from "../../../store/reducers/identifierViewTypeCache";
import { CardListViewType } from "../SwitchCardView";
import { setEnableBiometryCache } from "../../../store/reducers/biometryCache";

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
  if (event?.a?.r === NotificationRoute.ExnIpexGrant) {
    dispatch(
      setQueueIncomingRequest({
        id: event?.id,
        type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED,
        logo: "", // TODO: must define Keri logo
        label: "Credential Issuance Server", // TODO: must define it
      })
    );
  } else if (event?.a?.r === NotificationRoute.MultiSigIcp) {
    processMultiSigIcpNotification(event, dispatch);
  } else if (event?.a?.r === NotificationRoute.MultiSigRot) {
    //TODO: Use dispatch here, handle logic for the multisig rotation notification
  } else if (event?.a?.r === NotificationRoute.ExnIpexApply) {
    //TODO: Use dispatch here, handle logic for the exchange apply message
  } else if (event?.a?.r === NotificationRoute.ExnIpexAgree) {
    //TODO: Use dispatch here, handle logic for the exchange apply agree
  }
};

const processMultiSigIcpNotification = async (
  event: KeriaNotification,
  dispatch: ReturnType<typeof useAppDispatch>,
  retryInterval = 3000
) => {
  try {
    const multisigIcpDetails =
      await Agent.agent.multiSigs.getMultisigIcpDetails(event.a.d as string);
    dispatch(
      setQueueIncomingRequest({
        id: event?.id,
        event: event,
        type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING,
        multisigIcpDetails: multisigIcpDetails,
      })
    );
  } catch (error) {
    if (
      (error as Error).message == MultiSigService.UNKNOWN_AIDS_IN_MULTISIG_ICP
    ) {
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      await processMultiSigIcpNotification(event, dispatch, retryInterval);
    } else {
      throw error;
    }
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

const peerConnectRequestSignChangeHandler = async (
  event: PeerConnectSigningEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  //TODO: Handle logic for the accept/decline sing request
};

const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const operation = useAppSelector(getCurrentOperation);
  const [isOnline, setIsOnline] = useState(false);
  const [isMessagesHandled, setIsMessagesHandled] = useState(false);
  useActivityTimer();

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (authentication.loggedIn) {
      const handleMessages = async () => {
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
      if (!isMessagesHandled && isOnline) {
        handleMessages();
        setIsMessagesHandled(true);
      }
      dispatch(setPauseQueueIncomingRequest(!isOnline));
    } else {
      dispatch(setPauseQueueIncomingRequest(true));
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
    // TODO: Need update after core function completed.
    dispatch(setWalletConnectionsCache(walletConnectionsFix));
  };

  const loadCacheBasicStorage = async () => {
    let userName: { userName: string } = { userName: "" };
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const keriaConnectUrlRecord = await Agent.agent.basicStorage.findById(
      MiscRecordId.KERIA_CONNECT_URL
    );

    const identifiersFavourites = await Agent.agent.basicStorage.findById(
      MiscRecordId.IDENTIFIERS_FAVOURITES
    );
    if (identifiersFavourites)
      dispatch(
        setFavouritesIdentifiersCache(
          identifiersFavourites.content.favourites as FavouriteIdentifier[]
        )
      );

    const credsFavourites = await Agent.agent.basicStorage.findById(
      MiscRecordId.CREDS_FAVOURITES
    );
    if (credsFavourites) {
      dispatch(
        setFavouritesCredsCache(
          credsFavourites.content.favourites as FavouriteIdentifier[]
        )
      );
    }
    const viewType = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_IDENTIFIER_VIEW_TYPE
    );
    if (viewType) {
      dispatch(setViewTypeCache(viewType.content.viewType as CardListViewType));
    }
    const appBiometry = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_BIOMETRY
    );
    if (appBiometry) {
      dispatch(setEnableBiometryCache(appBiometry.content.enabled as boolean));
    }

    const appUserNameRecord = await Agent.agent.basicStorage.findById(
      MiscRecordId.USER_NAME
    );
    if (appUserNameRecord) {
      userName = appUserNameRecord.content as { userName: string };
    }

    dispatch(
      setAuthentication({
        ...authentication,
        userName: userName.userName as string,
        passcodeIsSet,
        seedPhraseIsSet,
        passwordIsSet,
        ssiAgentIsSet:
          !!keriaConnectUrlRecord && !!keriaConnectUrlRecord.content.url,
      })
    );

    return {
      keriaConnectUrlRecord,
    };
  };

  const initApp = async () => {
    await new ConfigurationService().start();
    await Agent.agent.initDatabaseConnection();
    // @TODO - foconnor: This is a temp hack for development to be removed pre-release.
    // These items are removed from the secure storage on re-install to re-test the on-boarding for iOS devices.
    const appAlreadyInit = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_ALREADY_INIT
    );
    if (!appAlreadyInit) {
      await SecureStorage.delete(KeyStoreKeys.APP_PASSCODE);
      await SecureStorage.delete(KeyStoreKeys.IDENTITY_ENTROPY);
      await SecureStorage.delete(KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY);
      await SecureStorage.delete(KeyStoreKeys.APP_OP_PASSWORD);
      await SecureStorage.delete(KeyStoreKeys.SIGNIFY_BRAN);
    }
    await loadDatabase();
    const { keriaConnectUrlRecord } = await loadCacheBasicStorage();

    if (keriaConnectUrlRecord) {
      try {
        await Agent.agent.start(keriaConnectUrlRecord.content.url as string);
        setIsOnline(true);
      } catch (e) {
        const errorStack = (e as Error).stack as string;
        // If the error is failed to fetch with signify, we retry until the connection is secured
        if (/SignifyClient/gi.test(errorStack)) {
          Agent.agent.connect().then(() => {
            setIsOnline(Agent.agent.getKeriaOnlineStatus());
          });
        } else {
          throw e;
        }
      }
    }

    Agent.agent.onKeriaStatusStateChanged((event) => {
      setIsOnline(event.payload.isOnline);
    });
    Agent.agent.connections.onConnectionStateChanged((event) => {
      return connectionStateChangedHandler(event, dispatch);
    });
    Agent.agent.signifyNotifications.onNotificationStateChanged((event) => {
      return keriaNotificationsChangeHandler(event, dispatch);
    });
    Agent.agent.credentials.onAcdcStateChanged((event) => {
      return acdcChangeHandler(event, dispatch);
    });
    PeerConnection.peerConnection.onPeerConnectRequestSignStateChanged(
      async (event) => {
        return peerConnectRequestSignChangeHandler(event, dispatch);
      }
    );
    dispatch(setInitialized(true));
  };

  return <>{props.children}</>;
};

export {
  AppWrapper,
  connectionStateChangedHandler,
  acdcChangeHandler,
  keriaNotificationsChangeHandler,
};
