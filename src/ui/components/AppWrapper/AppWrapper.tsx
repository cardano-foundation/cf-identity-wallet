import { LensFacing } from "@capacitor-mlkit/barcode-scanning";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import {
  ConnectionStatus,
  MiscRecordId,
} from "../../../core/agent/agent.types";
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
  setCredentialsFilters,
  setCredsCache,
  setFavouritesCredsCache,
  updateOrAddCredsCache,
} from "../../../store/reducers/credsCache";
import {
  setFavouritesIdentifiersCache,
  setIdentifiersCache,
  setIdentifiersFilters,
} from "../../../store/reducers/identifiersCache";
import { FavouriteIdentifier } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import {
  setCredentialViewTypeCache,
  setIdentifierFavouriteIndex,
  setIdentifierViewTypeCache,
} from "../../../store/reducers/viewTypeCache";
import { setNotificationsCache } from "../../../store/reducers/notificationsCache";
import {
  getAuthentication,
  getIsInitialized,
  getIsOnline,
  setAuthentication,
  setCameraDirection,
  setCurrentOperation,
  setInitialized,
  setIsOnline,
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
import { showError } from "../../utils/error";
import { Alert } from "../Alert";
import { CardListViewType } from "../SwitchCardView";
import "./AppWrapper.scss";
import { useActivityTimer } from "./hooks/useActivityTimer";
import {
  notificatiStateChanged,
  signifyOperationStateChangeHandler,
} from "./coreEventListeners";
import {
  AcdcStateChangedEvent,
  ConnectionStateChangedEvent,
} from "../../../core/agent/event.types";
import { IdentifiersFilters } from "../../pages/Identifiers/Identifiers.types";
import { CredentialsFilters } from "../../pages/Credentials/Credentials.types";

const connectionStateChangedHandler = async (
  event: ConnectionStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === ConnectionStatus.PENDING) {
    if (event.payload.isMultiSigInvite) return;

    dispatch(
      updateOrAddConnectionCache({
        id: event.payload.connectionId || "",
        label: event.payload.label || "",
        status: event.payload.status,
        createdAtUTC: new Date().toString(),
      })
    );
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

const acdcChangeHandler = async (
  event: AcdcStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  if (event.payload.status === CredentialStatus.PENDING) {
    dispatch(setToastMsg(ToastMsgType.CREDENTIAL_REQUEST_PENDING));
    dispatch(updateOrAddCredsCache(event.payload.credential));
  } else if (event.payload.status === CredentialStatus.REVOKED) {
    dispatch(updateOrAddCredsCache(event.payload.credential));
  } else {
    dispatch(updateOrAddCredsCache(event.payload.credential));
    dispatch(setToastMsg(ToastMsgType.NEW_CREDENTIAL_ADDED));
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

const AppWrapper = (props: { children: ReactNode }) => {
  const isOnline = useAppSelector(getIsOnline);
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const connectedWallet = useAppSelector(getConnectedWallet);
  const initAppSuccess = useAppSelector(getIsInitialized);
  const [isAlertPeerBrokenOpen, setIsAlertPeerBrokenOpen] = useState(false);
  useActivityTimer();

  const setOnlineStatus = useCallback(
    (value: boolean) => {
      dispatch(setIsOnline(value));
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
        Agent.agent.keriaNotifications.startNotification();
      } else {
        Agent.agent.keriaNotifications.stopNotification();
      }
    }
  }, [authentication.loggedIn, initAppSuccess]);

  useEffect(() => {
    if (!connectedWallet?.id) {
      return;
    }

    const eventHandler = async (event: PeerDisconnectedEvent) => {
      peerDisconnectedChangeHandler(event, connectedWallet.id, dispatch);
    };

    PeerConnection.peerConnection.onPeerDisconnectedStateChanged(eventHandler);

    return () => {
      PeerConnection.peerConnection.offPeerDisconnectedStateChanged(
        eventHandler
      );
    };
  }, [connectedWallet?.id, dispatch]);

  const checkKeyStore = async (key: string) => {
    try {
      const itemInKeyStore = await SecureStorage.get(key);
      return !!itemInKeyStore;
    } catch (e) {
      return false;
    }
  };

  const loadDatabase = async () => {
    try {
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
        await Agent.agent.keriaNotifications.getAllNotifications();

      dispatch(setIdentifiersCache(storedIdentifiers));
      dispatch(setCredsCache(credsCache));
      dispatch(setCredsArchivedCache(credsArchivedCache));
      dispatch(setConnectionsCache(connectionsDetails));
      dispatch(setMultisigConnectionsCache(multisigConnectionsDetails));
      dispatch(setWalletConnectionsCache(storedPeerConnections));
      dispatch(setNotificationsCache(notifications));
    } catch (e) {
      showError("Failed to load database data", e, dispatch);
    }
  };

  const loadCacheBasicStorage = async () => {
    try {
      let userName: { userName: string } = { userName: "" };
      let identifiersSelectedFilter: IdentifiersFilters =
        IdentifiersFilters.All;
      let credentialsSelectedFilter: CredentialsFilters =
        CredentialsFilters.All;
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
      const indentifierViewType = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_IDENTIFIER_VIEW_TYPE
      );
      if (indentifierViewType) {
        dispatch(
          setIdentifierViewTypeCache(
            indentifierViewType.content.viewType as CardListViewType
          )
        );
      }

      const indentifiersFilters = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_IDENTIFIER_SELECTED_FILTER
      );
      if (indentifiersFilters) {
        identifiersSelectedFilter = indentifiersFilters.content
          .filter as IdentifiersFilters;
      }
      if (identifiersSelectedFilter) {
        dispatch(setIdentifiersFilters(identifiersSelectedFilter));
      }

      const credViewType = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_CRED_VIEW_TYPE
      );

      if (credViewType) {
        dispatch(
          setCredentialViewTypeCache(
            credViewType.content.viewType as CardListViewType
          )
        );
      }

      const credentialsFilters = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_CRED_SELECTED_FILTER
      );
      if (credentialsFilters) {
        credentialsSelectedFilter = credentialsFilters.content
          .filter as CredentialsFilters;
      }
      if (credentialsSelectedFilter) {
        dispatch(setCredentialsFilters(credentialsSelectedFilter));
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

      const identifierFavouriteIndex = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_IDENTIFIER_FAVOURITE_INDEX
      );

      if (identifierFavouriteIndex) {
        dispatch(
          setIdentifierFavouriteIndex(
            Number(identifierFavouriteIndex.content.favouriteIndex)
          )
        );
      }

      const credFavouriteIndex = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_CRED_FAVOURITE_INDEX
      );

      if (credFavouriteIndex) {
        dispatch(
          setIdentifierFavouriteIndex(
            Number(credFavouriteIndex.content.favouriteIndex)
          )
        );
      }

      const cameraDirection = await Agent.agent.basicStorage.findById(
        MiscRecordId.CAMERA_DIRECTION
      );

      if (cameraDirection) {
        dispatch(
          setCameraDirection(cameraDirection.content.value as LensFacing)
        );
      }

      const passwordSkipped = await Agent.agent.basicStorage.findById(
        MiscRecordId.APP_PASSWORD_SKIPPED
      );

      const loginAttempt = await Agent.agent.auth.getLoginAttempts();

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
          loginAttempt,
        })
      );

      return {
        keriaConnectUrlRecord,
      };
    } catch (e) {
      showError("Failed to load cache data", e, dispatch);
      return {
        keriaConnectUrlRecord: null,
      };
    }
  };

  const setupEventServiceCallbacks = () => {
    Agent.agent.onKeriaStatusStateChanged((event) => {
      setOnlineStatus(event.payload.isOnline);
    });
    Agent.agent.connections.onConnectionStateChanged((event) => {
      return connectionStateChangedHandler(event, dispatch);
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
    Agent.agent.keriaNotifications.onNewNotification((event) => {
      notificatiStateChanged(event, dispatch);
    });

    Agent.agent.keriaNotifications.onLongOperationComplete((event) => {
      signifyOperationStateChangeHandler(event.payload, dispatch);
    });

    Agent.agent.keriaNotifications.onRemoveNotification((event) => {
      notificatiStateChanged(event, dispatch);
    });
  };

  const initApp = async () => {
    await new ConfigurationService().start();
    await Agent.agent.setupLocalDependencies();

    // @TODO - foconnor: This is a temp hack for development to be removed pre-release.
    // These items are removed from the secure storage on re-install to re-test the on-boarding for iOS devices.
    const initState = await Agent.agent.basicStorage.findById(
      MiscRecordId.APP_ALREADY_INIT
    );
    if (!initState) {
      await SecureStorage.delete(KeyStoreKeys.APP_PASSCODE);
      await SecureStorage.delete(KeyStoreKeys.APP_OP_PASSWORD);
      await SecureStorage.delete(KeyStoreKeys.SIGNIFY_BRAN);
    }

    // This will skip the onboarding screen with dev mode.
    if (process.env.DEV_SKIP_ONBOARDING === "true") {
      await Agent.agent.devPreload();
    }

    await loadDatabase();
    const { keriaConnectUrlRecord } = await loadCacheBasicStorage();

    // Ensure online/offline callback setup before connecting to KERIA
    setupEventServiceCallbacks();

    if (keriaConnectUrlRecord) {
      try {
        await Agent.agent.start(keriaConnectUrlRecord.content.url as string);
      } catch (e) {
        const errorMessage = (e as Error).message;
        // If the error is failed to fetch with signify, we retry until the connection is secured
        if (
          /Failed to fetch/gi.test(errorMessage) ||
          /Load failed/gi.test(errorMessage)
        ) {
          Agent.agent.connect(); // No await, background this task and continue initializing
        } else {
          throw e;
        }
      }
    }

    // Begin background polling of KERIA or local DB items
    Agent.agent.keriaNotifications.pollNotifications();
    Agent.agent.keriaNotifications.pollLongOperations();
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
          "tabs.menu.tab.items.connectwallet.connectionbrokenalert.message"
        )}
        confirmButtonText={`${i18n.t(
          "tabs.menu.tab.items.connectwallet.connectionbrokenalert.confirm"
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
  peerConnectRequestSignChangeHandler,
  peerConnectedChangeHandler,
  peerConnectionBrokenChangeHandler,
  peerDisconnectedChangeHandler,
};
