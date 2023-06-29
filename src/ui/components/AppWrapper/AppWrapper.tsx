import { useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
} from "../../../store/reducers/stateCache";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";
import { setDidsCache } from "../../../store/reducers/didsCache";
import { filteredDidsMock } from "../../__mocks__/filteredDidsMock";
import { setCredsCache } from "../../../store/reducers/credsCache";
import { filteredCredsMock } from "../../__mocks__/filteredCredsMock";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";
import { setCryptoAccountsCache } from "../../../store/reducers/cryptoAccountsCache";
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

    dispatch(
      setAuthentication({
        ...authentication,
        passcodeIsSet,
        seedPhraseIsSet,
        passwordIsSet,
      })
    );

    dispatch(setDidsCache(filteredDidsMock));
    dispatch(setCredsCache(filteredCredsMock));
    dispatch(setCryptoAccountsCache(cryptoAccountsMock));
  };

  return <>{props.children}</>;
};

export { AppWrapper };
