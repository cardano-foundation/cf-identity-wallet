import React, { useEffect, useState } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import Moment from "moment";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";
import { useAppSelector } from "../store/hooks";
import { getAuthentication } from "../store/reducers/StateCache";

const ROUTES = {
  ONBOARDING_ROUTE: "/onboarding",
  SET_PASSCODE_ROUTE: "/setpasscode",
  PASSCODE_LOGIN_ROUTE: "/passcodelogin",
  GENERATE_SEED_PHRASE_ROUTE: "/generateseedphrase",
  VERIFY_SEED_PHRASE_ROUTE: "/verifyseedphrase",
  DIDS_ROUTE: "/dids",
};


const MAX_LOCK_TIME = 300000; // 3 sec

const PrivateRoute: React.FC<RouteProps> = (props) => {
  const authentication = useAppSelector(getAuthentication);
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authentication.loggedIn
  );

  useEffect(() => {
    setIsAuthenticated(authentication.loggedIn);
  }, [authentication.loggedIn]);

  const sessionExpired = () => {
    // Timeout logic here
    return MAX_LOCK_TIME < Moment().valueOf() - authentication.time;
  };

  return isAuthenticated && !sessionExpired() ? (
    <Route
      {...props}
      component={props.component}
    />
  ) : (
    <Redirect
      from={location.pathname}
      to={{
        pathname: authentication.passcodeIsSet
          ? ROUTES.PASSCODE_LOGIN_ROUTE
          : ROUTES.ONBOARDING_ROUTE,
      }}
    />
  );
};

const Routes = () => {
  const authentication = useAppSelector(getAuthentication);
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Redirect
          exact
          from="/"
          to={
            authentication.passcodeIsSet && !authentication.loggedIn
              ? ROUTES.PASSCODE_LOGIN_ROUTE
              : ROUTES.ONBOARDING_ROUTE
          }
        />

        <Route
          path={ROUTES.PASSCODE_LOGIN_ROUTE}
          component={PasscodeLogin}
        />

        <Route
          path={ROUTES.SET_PASSCODE_ROUTE}
          component={SetPasscode}
        />

        <Route
          path={ROUTES.ONBOARDING_ROUTE}
          component={Onboarding}
        />

        {/* Private Routes */}
        <PrivateRoute
          path={ROUTES.GENERATE_SEED_PHRASE_ROUTE}
          component={GenerateSeedPhrase}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export {
  Routes,
  ROUTES
};
