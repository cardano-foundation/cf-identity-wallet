import { useEffect } from "react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
} from "../../../store/reducers/StateCache";

const AppWrapper = (props: { children: any }) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const passcodeIsSet = await SecureStorage.get("app-login-passcode");

    console.log("passcodeIsSet");
    console.log(!!passcodeIsSet);
    console.log(passcodeIsSet);
    dispatch(
      setAuthentication({ ...authentication, passcodeIsSet: !!passcodeIsSet })
    );
  };

  return <div id="appWrapper">{props.children}</div>;
};

export { AppWrapper };
