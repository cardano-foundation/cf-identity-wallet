import { ReactNode, useCallback, useEffect, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import {
  AcdcStateChangedEvent,
  ConnectionStateChangedEvent,
  ConnectionStatus,
  KeriaNotification,
  MiscRecordId,
} from "../../../core/agent/agent.types";
import { OperationPendingRecordType } from "../../../core/agent/records/operationPendingRecord.type";
import { CredentialStatus } from "../../../core/agent/services/credentialService.types";
import { PeerConnection } from "../../../core/cardano/walletConnect/peerConnection";
import {
  PeerConnectSigningEvent,
  PeerConnectedEvent,
  PeerConnectionBrokenEvent,
  PeerDisconnectedEvent,
} from "../../../core/cardano/walletConnect/peerConnection.types";
import { ConfigurationService } from "../../../core/configuration";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences/preferencesStorage";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setEnableBiometricsCache } from "../../../store/reducers/biometricsCache";
import {
  setConnectionsCache,
  setMultisigConnectionsCache,
  updateOrAddConnectionCache,
} from "../../../store/reducers/connectionsCache";
import { setCredsArchivedCache } from "../../../store/reducers/credsArchivedCache";
import {
  setCredsCache,
  setFavouritesCredsCache,
  updateOrAddCredsCache,
} from "../../../store/reducers/credsCache";
import {
  setFavouritesIdentifiersCache,
  setIdentifiersCache,
  updateIsPending,
} from "../../../store/reducers/identifiersCache";
import { FavouriteIdentifier } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import {
  setFavouriteIndex,
  setViewTypeCache,
} from "../../../store/reducers/identifierViewTypeCache";
import { setNotificationsCache } from "../../../store/reducers/notificationsCache";
import {
  getAuthentication,
  getIsInitialized,
  getIsOnline,
  setAuthentication,
  setCurrentOperation,
  setInitialized,
  setIsOnline as setOnlineStatus,
  setPauseQueueIncomingRequest,
  setQueueIncomingRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import {
  getConnectedWallet,
  setConnectedWallet,
  setPendingConnection,
  setWalletConnectionsCache,
} from "../../../store/reducers/walletConnectionsCache";
import { OperationType, ToastMsgType } from "../../globals/types";
import { Alert } from "../Alert";
import { CardListViewType } from "../SwitchCardView";
import "./AppWrapper.scss";
import { useActivityTimer } from "./hooks/useActivityTimer";

const connectionStateChangedHandler = async (
  event: ConnectionStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === ConnectionStatus.PENDING) {
    if (event.payload.isMultiSigInvite) return;

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
  const notifications =
    await Agent.agent.signifyNotifications.getAllNotifications();
  dispatch(setNotificationsCache(notifications));
};

const acdcChangeHandler = async (
  event: AcdcStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === CredentialStatus.PENDING) {
    dispatch(setCurrentOperation(OperationType.ADD_CREDENTIAL));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING));
  } else if (event.payload.status === CredentialStatus.REVOKED) {
    dispatch(updateOrAddCredsCache(event.payload.credential));
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_REVOKED));
    dispatch(setCurrentOperation(OperationType.IDLE));
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
  const connectedDAppAddress =
    PeerConnection.peerConnection.getConnectedDAppAddress();
  const peerConnection =
    await Agent.agent.peerConnectionMetadataStorage.getPeerConnection(
      connectedDAppAddress
    );
  dispatch(
    setQueueIncomingRequest({
      signTransaction: event,
      peerConnection,
      type: IncomingRequestType.PEER_CONNECT_SIGN,
    })
  );
};

const peerConnectedChangeHandler = async (
  event: PeerConnectedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const existingConnections =
    await Agent.agent.peerConnectionMetadataStorage.getAllPeerConnectionMetadata();
  dispatch(setWalletConnectionsCache(existingConnections));
  const connectedWallet = existingConnections.find(
    (connection) => connection.id === event.payload.dAppAddress
  );
  if (connectedWallet) {
    dispatch(setConnectedWallet(connectedWallet));
  }
  dispatch(setPendingConnection(null));
  dispatch(setToastMsg(ToastMsgType.CONNECT_WALLET_SUCCESS));
};

const peerDisconnectedChangeHandler = async (
  event: PeerDisconnectedEvent,
  connectedMeerKat: string | null,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (connectedMeerKat === event.payload.dAppAddress) {
    dispatch(setConnectedWallet(null));
    dispatch(setToastMsg(ToastMsgType.DISCONNECT_WALLET_SUCCESS));
  }
};

const peerConnectionBrokenChangeHandler = async (
  event: PeerConnectionBrokenEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  dispatch(setConnectedWallet(null));
  dispatch(setToastMsg(ToastMsgType.DISCONNECT_WALLET_SUCCESS));
};

const signifyOperationStateChangeHandler = async (
  { oid, opType }: { oid: string; opType: OperationPendingRecordType },
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  switch (opType) {
  case OperationPendingRecordType.Witness:
  case OperationPendingRecordType.Group:
    dispatch(updateIsPending({ id: oid, isPending: false }));
    dispatch(setToastMsg(ToastMsgType.IDENTIFIER_UPDATED));
    break;
  }
};

const AppWrapper = (props: { children: ReactNode }) => {
  const isOnline = useAppSelector(getIsOnline);
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const connectedWallet = useAppSelector(getConnectedWallet);
  const initAppSuccess = useAppSelector(getIsInitialized);
  const [isAlertPeerBrokenOpen, setIsAlertPeerBrokenOpen] = useState(false);
  useActivityTimer();

  const setIsOnline = useCallback(
    (value: boolean) => {
      dispatch(setOnlineStatus(value));
    },
    [dispatch]
  );

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (authentication.loggedIn) {
      dispatch(setPauseQueueIncomingRequest(!isOnline));
    } else {
      dispatch(setPauseQueueIncomingRequest(true));
    }
  }, [isOnline, authentication.loggedIn, dispatch]);

  useEffect(() => {
    const syncWithKeria = async () => {
      // Fetch and sync the identifiers, contacts and ACDCs from KERIA to our storage
      //
      // TODO: This got uncommented when we were redoing that by accident.
      // Right now if you delete a connection, it will re-appear after 2 reloads
      // because we haven’t updated Signify in a bit.
      // The issue was fixed in Signify main repo but we’re on a fork…
      // await Promise.all([
      // Agent.agent.identifiers.syncKeriaIdentifiers(),
      // Agent.agent.connections.syncKeriaContacts(),
      // Agent.agent.credentials.syncACDCs(),
      // ]);
    };
    if (isOnline) {
      syncWithKeria();
    }
  }, [isOnline, dispatch]);

  useEffect(() => {
    if (initAppSuccess) {
      if (authentication.loggedIn) {
        Agent.agent.signifyNotifications.startNotification();
      } else {
        Agent.agent.signifyNotifications.stopNotification();
      }
    }
  }, [authentication.loggedIn, initAppSuccess]);

  useEffect(() => {
    PeerConnection.peerConnection.onPeerDisconnectedStateChanged(
      async (event) => {
        if (!connectedWallet) {
          return;
        }
        return peerDisconnectedChangeHandler(
          event,
          connectedWallet.id,
          dispatch
        );
      }
    );
  }, [connectedWallet, dispatch]);

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
    const multisigConnectionsDetails =
      await Agent.agent.connections.getMultisigConnections();

    const credsCache = await Agent.agent.credentials.getCredentials();
    const credsArchivedCache = await Agent.agent.credentials.getCredentials(
      true
    );
    const storedIdentifiers = await Agent.agent.identifiers.getIdentifiers();
    const storedPeerConnections =
      await Agent.agent.peerConnectionMetadataStorage.getAllPeerConnectionMetadata();
    const notifications =
      await Agent.agent.signifyNotifications.getAllNotifications();

    dispatch(setIdentifiersCache(storedIdentifiers));
    dispatch(setCredsCache(credsCache));
    dispatch(setCredsArchivedCache(credsArchivedCache));
    dispatch(setConnectionsCache(connectionsDetails));
    dispatch(setMultisigConnectionsCache(multisigConnectionsDetails));
    dispatch(setWalletConnectionsCache(storedPeerConnections));
    dispatch(setNotificationsCache(notifications));
  };

  const loadCacheBasicStorage = async () => {
    let userName: { userName: string } = { userName: "" };
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(KeyStoreKeys.SIGNIFY_BRAN);

    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const keriaConnectUrlRecord = await Agent.agent.basicStorage.findById(
      MiscRecordId.KERIA_CONNECT_URL
    );

    const recoveryWalletProgress = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_RECOVERY_WALLET
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
    const appBiometrics = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_BIOMETRY
    );
    if (appBiometrics) {
      dispatch(
        setEnableBiometricsCache(appBiometrics.content.enabled as boolean)
      );
    }

    const appUserNameRecord = await Agent.agent.basicStorage.findById(
      MiscRecordId.USER_NAME
    );
    if (appUserNameRecord) {
      userName = appUserNameRecord.content as { userName: string };
    }

    const favouriteIndex = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_IDENTIFIER_FAVOURITE_INDEX
    );

    if (favouriteIndex) {
      dispatch(
        setFavouriteIndex(Number(favouriteIndex.content.favouriteIndex))
      );
    }

    const passwordSkipped = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_PASSWORD_SKIPPED
    );

    dispatch(
      setAuthentication({
        ...authentication,
        userName: userName.userName as string,
        passcodeIsSet,
        seedPhraseIsSet,
        passwordIsSet,
        passwordIsSkipped: !!passwordSkipped?.content.value,
        ssiAgentIsSet:
          !!keriaConnectUrlRecord && !!keriaConnectUrlRecord.content.url,
        recoveryWalletProgress: !!recoveryWalletProgress?.content.value,
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
    try {
      // @TODO - foconnor: This should use our normal DB - keeping Preferences temporarily to not break existing mobile builds.
      // Will remove preferences again once we have better handling on APP_ALREADY_INIT with user input.
      await PreferencesStorage.get(PreferencesKeys.APP_ALREADY_INIT);
    } catch (e) {
      await SecureStorage.delete(KeyStoreKeys.APP_PASSCODE);
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
        if (
          /Failed to fetch/gi.test(errorStack) &&
          /SignifyClient/gi.test(errorStack)
        ) {
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
    PeerConnection.peerConnection.onPeerConnectedStateChanged(async (event) => {
      return peerConnectedChangeHandler(event, dispatch);
    });
    PeerConnection.peerConnection.onPeerConnectionBrokenStateChanged(
      async (event) => {
        setIsAlertPeerBrokenOpen(true);
        return peerConnectionBrokenChangeHandler(event, dispatch);
      }
    );
    Agent.agent.signifyNotifications.onSignifyOperationStateChanged((event) => {
      return signifyOperationStateChangeHandler(event, dispatch);
    });
    dispatch(setInitialized(true));
  };

  return (
    <>
      {props.children}
      <Alert
        isOpen={isAlertPeerBrokenOpen}
        setIsOpen={setIsAlertPeerBrokenOpen}
        dataTestId="alert-confirm-connection-broken"
        headerText={i18n.t(
          "menu.tab.items.connectwallet.connectionbrokenalert.message"
        )}
        confirmButtonText={`${i18n.t(
          "menu.tab.items.connectwallet.connectionbrokenalert.confirm"
        )}`}
        actionConfirm={() => dispatch(setCurrentOperation(OperationType.IDLE))}
        actionDismiss={() => dispatch(setCurrentOperation(OperationType.IDLE))}
      />
    </>
  );
};

export {
  AppWrapper,
  acdcChangeHandler,
  connectionStateChangedHandler,
  keriaNotificationsChangeHandler,
  peerConnectRequestSignChangeHandler,
  peerConnectedChangeHandler,
  peerConnectionBrokenChangeHandler,
  peerDisconnectedChangeHandler,
  signifyOperationStateChangeHandler,
};
