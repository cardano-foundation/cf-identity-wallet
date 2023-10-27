import { ReactNode, useEffect, useState } from "react";
import {
  BasicMessageStateChangedEvent,
  ConnectionStateChangedEvent,
  CredentialStateChangedEvent,
} from "@aries-framework/core";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setCurrentOperation,
  setInitialized,
  setQueueConnectionCredentialRequest,
} from "../../../store/reducers/stateCache";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import {
  setFavouritesIdentitiesCache,
  setIdentitiesCache,
} from "../../../store/reducers/identitiesCache";
import {
  setCredsCache,
  setFavouritesCredsCache,
  updateOrAddCredsCache,
} from "../../../store/reducers/credsCache";
import { AriesAgent } from "../../../core/agent/agent";
import {
  setCryptoAccountsCache,
  setHideCryptoBalances,
} from "../../../store/reducers/cryptoAccountsCache";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";
import {
  setConnectionsCache,
  updateOrAddConnectionCache,
} from "../../../store/reducers/connectionsCache";
import { ConnectionCredentialRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { toastState } from "../../constants/dictionary";
import { CredentialMetadataRecordStatus } from "../../../core/agent/modules/generalStorage/repositories/credentialMetadataRecord.types";
import { ColorGenerator } from "../../utils/ColorGenerator";
import { CredentialShortDetails } from "../../../core/agent/agent.types";
import { FavouriteIdentity } from "../../../store/reducers/identitiesCache/identitiesCache.types";

const connectionStateChangedHandler = async (
  event: ConnectionStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const connectionRecord = event.payload.connectionRecord;
  if (AriesAgent.agent.connections.isConnectionRequestSent(connectionRecord)) {
    const connectionDetails =
      AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setCurrentOperation(toastState.connectionRequestPending));
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
    dispatch(setCurrentOperation(toastState.connectionRequestIncoming));
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
    dispatch(setCurrentOperation(toastState.connectionRequestPending));
  } else if (
    AriesAgent.agent.connections.isConnectionConnected(connectionRecord)
  ) {
    const connectionDetails =
      AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
    dispatch(updateOrAddConnectionCache(connectionDetails));
    dispatch(setCurrentOperation(toastState.newConnectionAdded));
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
      credentialSubject: {},
    };
    await AriesAgent.agent.credentials.createMetadata({
      ...credentialDetails,
      credentialRecordId: credentialRecord.id,
    });
    dispatch(setCurrentOperation(toastState.credentialRequestPending));
    dispatch(updateOrAddCredsCache(credentialDetails));
  } else if (AriesAgent.agent.credentials.isCredentialDone(credentialRecord)) {
    const credentialShortDetails =
      await AriesAgent.agent.credentials.updateMetadataCompleted(
        credentialRecord
      );
    dispatch(setCurrentOperation(toastState.newCredentialAdded));
    dispatch(updateOrAddCredsCache(credentialShortDetails));
  }
};

const messageStateChangedHandler = async (
  event: BasicMessageStateChangedEvent,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  const messageRecord = event.payload.basicMessageRecord;
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
    const connectionsDetails =
      await AriesAgent.agent.connections.getConnections();
    const credentials = await AriesAgent.agent.credentials.getCredentials();
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const storedIdentities =
      await AriesAgent.agent.identifiers.getIdentifiers();
    // @TODO - sdisalvo: This will need to be updated as soon as we have something to get our stored crypto accounts.
    const storedCryptoAccounts: CryptoAccountProps[] = [];

    try {
      const hideCryptoBalances = await PreferencesStorage.get(
        PreferencesKeys.APP_HIDE_CRYPTO_BALANCES
      );
      dispatch(setHideCryptoBalances(!!hideCryptoBalances.hidden));
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }

    try {
      const didsFavourites = await PreferencesStorage.get(
        PreferencesKeys.APP_DIDS_FAVOURITES
      );
      dispatch(
        setFavouritesIdentitiesCache(
          didsFavourites.favourites as FavouriteIdentity[]
        )
      );

      const credsFavourites = await PreferencesStorage.get(
        PreferencesKeys.APP_CREDS_FAVOURITES
      );
      dispatch(
        setFavouritesCredsCache(
          credsFavourites.favourites as FavouriteIdentity[]
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

    dispatch(setIdentitiesCache(storedIdentities));
    dispatch(setCredsCache(credentials));
    dispatch(setCryptoAccountsCache(storedCryptoAccounts));
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
    // pickup messages
    AriesAgent.agent.messages.pickupMessagesFromMediator();
    setInitialised(true);
  };

  return initialised ? <>{props.children}</> : <></>;
};

export {
  AppWrapper,
  connectionStateChangedHandler,
  credentialStateChangedHandler,
};
