import { useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";

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
      dispatch(setCurrentRoute({ path: window.location.pathname }));
    } catch (e) {
      /* empty */
    }
  };

  return <>{props.children}</>;
};

export { AppWrapper };
