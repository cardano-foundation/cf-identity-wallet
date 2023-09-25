import { ReactNode, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setConnectionRequest,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { setIdentitiesCache } from "../../../store/reducers/identitiesCache";
import { setCredsCache } from "../../../store/reducers/credsCache";
import { filteredCredsFix } from "../../__fixtures__/filteredCredsFix";
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
import { ConnectionRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import { toastState } from "../../constants/dictionary";

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
    await AriesAgent.agent.start();
    const connectionsDetails = await AriesAgent.agent.connections.getConnections();
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

    dispatch(
      setAuthentication({
        ...authentication,
        passcodeIsSet,
        seedPhraseIsSet,
        passwordIsSet,
      })
    );

    dispatch(setIdentitiesCache(storedIdentities));
    dispatch(setCredsCache(filteredCredsFix));
    dispatch(setCryptoAccountsCache(storedCryptoAccounts));
    dispatch(setConnectionsCache(connectionsDetails));

    AriesAgent.agent.connections.onConnectionStateChange(async (event) => {
      const connectionRecord = event.payload.connectionRecord;
      if (AriesAgent.agent.connections.isConnectionRequestSent(connectionRecord)) {
        const connectionDetails =
          AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
        dispatch(updateOrAddConnectionCache(connectionDetails));
        dispatch(setCurrentOperation(toastState.connectionRequestPending));
      } else if (
        AriesAgent.agent.connections.isConnectionResponseReceived(connectionRecord)
      ) {
        dispatch(
          setConnectionRequest({
            id: connectionRecord.id,
            type: ConnectionRequestType.CONNECTION_RESPONSE,
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
          setConnectionRequest({
            id: connectionRecord.id,
            type: ConnectionRequestType.CONNECTION_INCOMING,
          })
        );
      } else if (AriesAgent.agent.connections.isConnectionResponseSent(connectionRecord)) {
        dispatch(setCurrentOperation(toastState.connectionRequestPending));
      } else if (AriesAgent.agent.connections.isConnectionConnected(connectionRecord)) {
        const connectionDetails =
          AriesAgent.agent.connections.getConnectionShortDetails(connectionRecord);
        dispatch(updateOrAddConnectionCache(connectionDetails));
        dispatch(setCurrentOperation(toastState.newConnectionAdded));
      }
    });

    setInitialised(true);
  };

  return initialised ? <>{props.children}</> : <></>;
};

export { AppWrapper };
