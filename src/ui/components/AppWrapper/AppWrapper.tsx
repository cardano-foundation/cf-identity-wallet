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
import { AriesAgent } from "../../../core/aries/ariesAgent";
import {
  setCryptoAccountsCache,
  setHideCryptoBalances,
} from "../../../store/reducers/cryptoAccountsCache";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";
import { setConnectionsCache } from "../../../store/reducers/connectionsCache";
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
    const connections = await AriesAgent.agent.getConnections();
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const storedIdentities = await AriesAgent.agent.getIdentities();
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
    dispatch(setConnectionsCache(connections));

    AriesAgent.agent.onConnectionStateChange(async (event) => {
      const connections = await AriesAgent.agent.getConnections();
      // @TODO: FOR TEST
      // eslint-disable-next-line no-console
      console.log("onConnectionStateChange", event);
      if (
        AriesAgent.agent.isConnectionRequestSent(event.payload.connectionRecord)
      ) {
        dispatch(setConnectionsCache(connections));
        dispatch(setCurrentOperation(toastState.connectionRequestPending));
      }
      if (
        AriesAgent.agent.isConnectionResponseReceived(
          event.payload.connectionRecord
        )
      ) {
        dispatch(
          setConnectionRequest({
            id: event.payload.connectionRecord.id,
            type: ConnectionRequestType.CONNECTION_RESPONSE,
          })
        );
      }
      if (
        AriesAgent.agent.isConnectionRequestReceived(
          event.payload.connectionRecord
        )
      ) {
        dispatch(setConnectionsCache(connections));
        dispatch(setCurrentOperation(toastState.connectionRequestIncoming));
        dispatch(
          setConnectionRequest({
            id: event.payload.connectionRecord.id,
            type: ConnectionRequestType.CONNECTION_INCOMING,
          })
        );
      }
      if (
        AriesAgent.agent.isConnectionResponseSent(
          event.payload.connectionRecord
        )
      ) {
        dispatch(setCurrentOperation(toastState.connectionRequestPending));
      }
      if (
        AriesAgent.agent.isConnectionConnected(event.payload.connectionRecord)
      ) {
        dispatch(setConnectionsCache(connections));
        dispatch(setCurrentOperation(toastState.newConnectionAdded));
      }
    });

    setInitialised(true);
  };

  return initialised ? <>{props.children}</> : <></>;
};

export { AppWrapper };
