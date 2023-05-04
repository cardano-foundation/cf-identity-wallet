import { useEffect, useState } from "react";
import { Redirect, Route, RouteProps, useHistory } from "react-router-dom";

import { useIonViewWillEnter } from "@ionic/react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { SET_PASSCODE_ROUTE } from "../../../routes";
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

    dispatch(
      setAuthentication({ ...authentication, passcodeIsSet: !!passcodeIsSet })
    );
  };

  return <div id="appWrapper">{props.children}</div>;
};

export { AppWrapper };
