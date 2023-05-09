import { useEffect, ReactNode } from "react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
} from "../../../store/reducers/StateCache";

const AppWrapper = (props: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const passcodeIsSet = await SecureStorage.get("app-login-passcode");

    dispatch(
      setAuthentication({ ...authentication, passcodeIsSet: !!passcodeIsSet })
    );
  };

  return <div id="appWrapper">{props.children}</div>;
};

export { AppWrapper };
