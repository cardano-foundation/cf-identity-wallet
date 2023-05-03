import React, { FC, useEffect, useState } from "react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import Moment from "moment";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";
import { useAppSelector } from "../store/hooks";
import { getAuthentication } from "../store/reducers/StateCache";

const ONBOARDING_ROUTE = "/onboarding";
const SET_PASSCODE_ROUTE = "/setpasscode";
const PASSCODE_LOGIN_ROUTE = "/passcodelogin";
const GENERATE_SEED_PHRASE_ROUTE = "/generateseedphrase";

const MAX_LOCK_TIME = 3000; // 3 sec

export interface PrivateRouteProps extends RouteProps {}

const PrivateRoute: React.FC<PrivateRouteProps> = (props) => {
  const authentication = useAppSelector(getAuthentication);
  const location = useLocation();

  const checkAuth = () => {
    // Auth logic here
    return MAX_LOCK_TIME < Moment.utc().millisecond() - authentication.time;
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkAuth());

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, [authentication.time]);
  return isAuthenticated || true ? (
    <Route
      {...props}
      component={props.component}
    />
  ) : (
    <Redirect from={location.pathname} to={{ pathname: PASSCODE_LOGIN_ROUTE }} />
  );
};

const Routes = () => {

  return (
    <IonReactRouter>
      <IonRouterOutlet>

        <Route
            path={SET_PASSCODE_ROUTE}
            component={SetPasscode}
        />

        {/* Private Routes */}
        <PrivateRoute path={ONBOARDING_ROUTE} component={Onboarding} />
        <PrivateRoute path={GENERATE_SEED_PHRASE_ROUTE} component={GenerateSeedPhrase} />

      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export {
  Routes,
  ONBOARDING_ROUTE,
  SET_PASSCODE_ROUTE,
  PASSCODE_LOGIN_ROUTE,
  GENERATE_SEED_PHRASE_ROUTE,
};
