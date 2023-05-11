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
enum RoutePath {
  ROOT = "/",
  ONBOARDING = "/onboarding",
  SET_PASSCODE = "/setpasscode",
  PASSCODE_LOGIN = "/passcodelogin",
  GENERATE_SEED_PHRASE = "/generateseedphrase",
  VERIFY_SEED_PHRASE = "/verifyseedphrase",
  DIDS = "/dids",
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
          ? RoutePath.PASSCODE_LOGIN
          : RoutePath.ONBOARDING,
      }}
    />
  );
};

const Routes = () => {
  const storeState = useAppSelector(getState);

  const { nextPath } = getNextRoute(RoutePath.ROOT, {
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
          path={RoutePath.PASSCODE_LOGIN}
          component={PasscodeLogin}
        />

        <Route
          path={RoutePath.SET_PASSCODE}
          component={SetPasscode}
        />

        <Route
          path={RoutePath.ONBOARDING}
          component={Onboarding}
        />

        {/* Private Routes */}
        <AuthenticatedRoute
          path={RoutePath.GENERATE_SEED_PHRASE}
          component={GenerateSeedPhrase}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export { Routes, RoutePath };
