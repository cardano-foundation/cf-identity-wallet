import React, { useEffect, useState } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";
import { VerifySeedPhrase } from "../ui/pages/VerifySeedPhrase";
import { CreatePassword } from "../ui/pages/CreatePassword";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getAuthentication,
  getRoutes,
  getState,
  setCurrentRoute,
} from "../store/reducers/stateCache";
import { getNextRoute } from "./nextRoute";
import { TabsMenu } from "../ui/components/navigation/TabsMenu";
import { RoutePath } from "./paths";
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
  const dispatch = useAppDispatch();
  const routes = useAppSelector(getRoutes);
  const { nextPath } = getNextRoute(RoutePath.ROOT, {
    store: storeState,
  });

  useEffect(() => {
    if (!routes.length) dispatch(setCurrentRoute({ path: nextPath.pathname }));
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
        <AuthenticatedRoute
          path={RoutePath.VERIFY_SEED_PHRASE}
          exact
          component={VerifySeedPhrase}
        />
        <AuthenticatedRoute
          path={RoutePath.TABS_MENU}
          exact
          component={TabsMenu}
        />
        <AuthenticatedRoute
          path={RoutePath.CREATE_PASSWORD}
          exact
          component={CreatePassword}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export { Routes, RoutePath };
