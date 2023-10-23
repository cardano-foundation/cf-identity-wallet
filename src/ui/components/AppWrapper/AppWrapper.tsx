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
  setConnectionCredentialRequest,
  setCurrentOperation,
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
import {
  ConnectionShortDetails,
  CredentialShortDetails,
  IdentifierShortDetails,
} from "../../../core/agent/agent.types";
import { FavouriteIdentity } from "../../../store/reducers/identitiesCache/identitiesCache.types";
import { PreferencesStorageItem } from "../../../core/storage/preferences/preferencesStorage.type";

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
      setConnectionCredentialRequest({
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
      setConnectionCredentialRequest({
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
      setConnectionCredentialRequest({
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

    const res = await fetch("https://dev.mediator.cf-keripy.metadata.dev.cf-deployments.org/invitation?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIzY2E3NjhhYS1kNWUyLTRiMGYtYjIwOC0yNGNiMjMxZTdhNTgiLCJsYWJlbCI6IkFyaWVzIEZyYW1ld29yayBKYXZhU2NyaXB0IE1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHA6Ly9kZXYubWVkaWF0b3IuY2Yta2VyaXB5Lm1ldGFkYXRhLmRldi5jZi1kZXBsb3ltZW50cy5vcmc6MjAxNSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rdmk1RG1nbTg2Q1FUM3JveDZ2dExZNzN0RUZzVkVjSkRYdXNSWDRZdDloczQiXSwicm91dGluZ0tleXMiOltdfSx7ImlkIjoiI2lubGluZS0xIiwic2VydmljZUVuZHBvaW50Ijoid3M6Ly9kZXYubWVkaWF0b3IuY2Yta2VyaXB5Lm1ldGFkYXRhLmRldi5jZi1kZXBsb3ltZW50cy5vcmc6MjAxNSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rdmk1RG1nbTg2Q1FUM3JveDZ2dExZNzN0RUZzVkVjSkRYdXNSWDRZdDloczQiXSwicm91dGluZ0tleXMiOltdfV19");
    console.log(JSON.stringify(res, null, 2));
    console.log("done");

    await AriesAgent.agent.start();
    const connectionsDetails: ConnectionShortDetails[] = []; // =
    // await AriesAgent.agent.connections.getConnections();
    const credentials: CredentialShortDetails[] = []; //await AriesAgent.agent.credentials.getCredentials();
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const storedIdentities: IdentifierShortDetails[] = [];
    // await AriesAgent.agent.identifiers.getIdentifiers();
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

    // AriesAgent.agent.connections.onConnectionStateChanged((event) => {
    //   return connectionStateChangedHandler(event, dispatch);
    // });
    // AriesAgent.agent.credentials.onCredentialStateChanged((event) => {
    //   return credentialStateChangedHandler(event, dispatch);
    // });
    // AriesAgent.agent.messages.onBasicMessageStateChanged((event) => {
    //   return messageStateChangedHandler(event, dispatch);
    // });
    // pickup messages
    // AriesAgent.agent.messages.pickupMessagesFromMediator();
    setInitialised(true);
  };

  return initialised ? <>{props.children}</> : <></>;
};

export {
  AppWrapper,
  connectionStateChangedHandler,
  credentialStateChangedHandler,
};
