import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getIsInitialized,
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
  updateIsPending,
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
import {
  getConnectedWallet,
  setConnectedWallet,
  setPendingConnection,
  setWalletConnectionsCache,
} from "../../../store/reducers/walletConnectionsCache";
import { PeerConnection } from "../../../core/cardano/walletConnect/peerConnection";
import {
  PeerConnectSigningEvent,
  PeerConnectedEvent,
  PeerConnectionBrokenEvent,
  PeerDisconnectedEvent,
} from "../../../core/cardano/walletConnect/peerConnection.types";
import { MultiSigService } from "../../../core/agent/services/multiSigService";
import {
  setFavouriteIndex,
  setViewTypeCache,
} from "../../../store/reducers/identifierViewTypeCache";
import { CardListViewType } from "../SwitchCardView";
import { setEnableBiometricsCache } from "../../../store/reducers/biometricsCache";
import { setCredsArchivedCache } from "../../../store/reducers/credsArchivedCache";
import { OperationPendingRecordType } from "../../../core/agent/records/operationPendingRecord.type";
import { i18n } from "../../../i18n";
import { Alert } from "../Alert";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences/preferencesStorage";

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
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const connectedWallet = useAppSelector(getConnectedWallet);
  const initAppSuccess = useAppSelector(getIsInitialized);
  const [isOnline, setIsOnline] = useState(false);
  const [isMessagesHandled, setIsMessagesHandled] = useState(false);
  const [isAlertPeerBrokenOpen, setIsAlertPeerBrokenOpen] = useState(false);
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
  }, [isOnline, authentication.loggedIn, isMessagesHandled, dispatch]);

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

    const credsCache = await Agent.agent.credentials.getCredentials();
    const credsArchivedCache = await Agent.agent.credentials.getCredentials(
      true
    );
    const storedIdentifiers = await Agent.agent.identifiers.getIdentifiers();
    const storedPeerConnections =
      await Agent.agent.peerConnectionMetadataStorage.getAllPeerConnectionMetadata();

    dispatch(setIdentifiersCache(storedIdentifiers));
    dispatch(setCredsCache(credsCache));
    dispatch(setCredsArchivedCache(credsArchivedCache));
    dispatch(setConnectionsCache(connectionsDetails));
    dispatch(setWalletConnectionsCache(storedPeerConnections));
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
  connectionStateChangedHandler,
  acdcChangeHandler,
  keriaNotificationsChangeHandler,
  peerConnectedChangeHandler,
  peerDisconnectedChangeHandler,
  peerConnectRequestSignChangeHandler,
  peerConnectionBrokenChangeHandler,
  signifyOperationStateChangeHandler,
};
