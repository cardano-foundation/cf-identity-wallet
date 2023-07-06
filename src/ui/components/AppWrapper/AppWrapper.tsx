import { useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
} from "../../../store/reducers/stateCache";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage";
import { setIdentitiesCache } from "../../../store/reducers/identitiesCache";
import { setCredsCache } from "../../../store/reducers/credsCache";
import { filteredCredsMock } from "../../__mocks__/filteredCredsMock";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import {
  setCryptoAccountsCache,
  setDefaultCryptoAccountCache,
} from "../../../store/reducers/cryptoAccountsCache";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);

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
    const passcodeIsSet = await checkKeyStore(KeyStoreKeys.APP_PASSCODE);
    const seedPhraseIsSet = await checkKeyStore(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    const passwordIsSet = await checkKeyStore(KeyStoreKeys.APP_OP_PASSWORD);
    const storedIdentities = await AriesAgent.agent.getIdentities();

    try {
      const defaultCryptoAccount = await PreferencesStorage.get(
        PreferencesKeys.APP_DEFAULT_CRYPTO_ACCOUNT
      );
      dispatch(setDefaultCryptoAccountCache(`${defaultCryptoAccount.data}`));
    } catch (e) {
      if (cryptoAccountsMock.length) {
        dispatch(setDefaultCryptoAccountCache(cryptoAccountsMock[0].address));
      } else {
        // @TODO - sdisalvo: handle error
      }
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
    dispatch(setCredsCache(filteredCredsMock));
    dispatch(setCryptoAccountsCache(cryptoAccountsMock));
  };

  return <>{props.children}</>;
};

export { AppWrapper };
