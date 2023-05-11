import React, { useEffect, useState } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";
import { useAppSelector } from "../store/hooks";
import { getAuthentication, getState } from "../store/reducers/stateCache";
import { getNextRoute } from "./nextRoute";
enum RoutePaths {
  ROOT_ROUTE = "/",
  ONBOARDING_ROUTE = "/onboarding",
  SET_PASSCODE_ROUTE = "/setpasscode",
  PASSCODE_LOGIN_ROUTE = "/passcodelogin",
  GENERATE_SEED_PHRASE_ROUTE = "/generateseedphrase",
  VERIFY_SEED_PHRASE_ROUTE = "/verifyseedphrase",
  DIDS_ROUTE = "/dids",
}

const AuthenticatedRoute: React.FC<RouteProps> = (props) => {
  const authentication = useAppSelector(getAuthentication);
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authentication.loggedIn
  );

  useEffect(() => {
    setIsAuthenticated(authentication.loggedIn);
  }, [authentication.loggedIn]);

  return isAuthenticated ? (
    <Route
      {...props}
      component={props.component}
    />
  ) : (
    <Redirect
      from={location.pathname}
      to={{
        pathname: authentication.passcodeIsSet
          ? RoutePaths.PASSCODE_LOGIN_ROUTE
          : RoutePaths.ONBOARDING_ROUTE,
      }}
    />
  );
};

const Routes = () => {
  const storeState = useAppSelector(getState);

  const { nextPath } = getNextRoute(RoutePaths.ROOT_ROUTE, {
    store: storeState,
  });

  return (
    <IonReactRouter>
      <IonRouterOutlet animated={false}>
        <Redirect
          exact
          from="/"
          to={nextPath}
        />

        <Route
          path={RoutePaths.PASSCODE_LOGIN_ROUTE}
          component={PasscodeLogin}
        />

        <Route
          path={RoutePaths.SET_PASSCODE_ROUTE}
          component={SetPasscode}
        />

        <Route
          path={RoutePaths.ONBOARDING_ROUTE}
          component={Onboarding}
        />

        {/* Private Routes */}
        <AuthenticatedRoute
          path={RoutePaths.GENERATE_SEED_PHRASE_ROUTE}
          component={GenerateSeedPhrase}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export { Routes, RoutePaths };
