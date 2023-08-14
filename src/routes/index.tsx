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
  getStateCache,
  setCurrentRoute,
} from "../store/reducers/stateCache";
import { getNextRoute } from "./nextRoute";
import { TabsMenu, tabsRoutes } from "../ui/components/navigation/TabsMenu";
import { RoutePath } from "./paths";
import { DidCardDetails } from "../ui/pages/DidCardDetails";
import { CredCardDetails } from "../ui/pages/CredCardDetails";
import { ConnectionDetails } from "../ui/pages/ConnectionDetails";

interface AuthenticatedRouteProps extends RouteProps {
  nextPathname: string;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = (props) => {
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
        pathname: props.nextPathname,
      }}
    />
  );
};

const Routes = () => {
  const stateCache = useAppSelector(getStateCache);
  const dispatch = useAppDispatch();
  const routes = useAppSelector(getRoutes);
  const { nextPath } = getNextRoute(RoutePath.ROOT, {
    store: { stateCache },
  });

  useEffect(() => {
    if (!routes.length) dispatch(setCurrentRoute({ path: nextPath.pathname }));
  });

  return (
    <IonReactRouter>
      <IonRouterOutlet animated={false}>
        <Route
          path={RoutePath.PASSCODE_LOGIN}
          component={PasscodeLogin}
          exact
        />

        <Route
          path={RoutePath.SET_PASSCODE}
          component={SetPasscode}
          exact
        />

        <Route
          path={RoutePath.ONBOARDING}
          component={Onboarding}
          exact
        />

        {/* Private Routes */}
        <AuthenticatedRoute
          path={RoutePath.GENERATE_SEED_PHRASE}
          component={GenerateSeedPhrase}
          nextPathname={nextPath.pathname}
        />
        <AuthenticatedRoute
          path={RoutePath.VERIFY_SEED_PHRASE}
          exact
          component={VerifySeedPhrase}
          nextPathname={nextPath.pathname}
        />
        <AuthenticatedRoute
          path={RoutePath.TABS_MENU}
          exact
          component={TabsMenu}
          nextPathname={nextPath.pathname}
        />
        <AuthenticatedRoute
          path={RoutePath.CREATE_PASSWORD}
          exact
          component={CreatePassword}
          nextPathname={nextPath.pathname}
        />
        <AuthenticatedRoute
          path={RoutePath.CONNECTION_DETAILS}
          exact
          component={ConnectionDetails}
          nextPathname={nextPath.pathname}
        />
        {tabsRoutes.map((tab, index: number) => {
          return (
            <AuthenticatedRoute
              key={index}
              path={tab.path}
              exact
              render={() => (
                <TabsMenu
                  tab={tab.component}
                  path={tab.path}
                />
              )}
              nextPathname={nextPath.pathname}
            />
          );
        })}
        <AuthenticatedRoute
          path="/tabs/dids/:id"
          component={DidCardDetails}
          exact
          nextPathname={nextPath.pathname}
        />
        <AuthenticatedRoute
          path="/tabs/creds/:id"
          component={CredCardDetails}
          exact
          nextPathname={nextPath.pathname}
        />
        <Redirect
          exact
          from="/"
          to={nextPath}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export { Routes, RoutePath };
