import { useEffect, ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
} from "../../../store/reducers/StateCache";
import {KeyStoreKeys, SecureStorage} from "../../../core/storage/secureStorage";

const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const passcodeIsSet = await SecureStorage.get(KeyStoreKeys.APP_PASSCODE);

    dispatch(
      setAuthentication({ ...authentication, passcodeIsSet: !!passcodeIsSet })
    );
  };

  return <>{props.children}</>;
};

export { AppWrapper };
