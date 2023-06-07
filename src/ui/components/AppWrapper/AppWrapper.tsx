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
const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const passcodeIsSet = await SecureStorage.get(KeyStoreKeys.APP_PASSCODE);

      dispatch(
        setAuthentication({ ...authentication, passcodeIsSet: !!passcodeIsSet })
      );

      dispatch(setDidsCache(filteredDidsMock));
    } catch (e) {
      /* empty */
    }
  };

  return <>{props.children}</>;
};

export { AppWrapper };
