import React from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route, RouteProps, useLocation } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";
import { VerifySeedPhrase } from "../ui/pages/VerifySeedPhrase";
import { CreatePassword } from "../ui/pages/CreatePassword";
import { useAppSelector } from "../store/hooks";
import { getAuthentication } from "../store/reducers/stateCache";
import {
  TabsMenu,
  TabsRoutePath,
  tabsRoutes,
} from "../ui/components/navigation/TabsMenu";
import { RoutePath } from "./paths";
import { IdentifierDetails } from "../ui/pages/IdentifierDetails";
import { CredentialDetails } from "../ui/pages/CredentialDetails";
import { ConnectionDetails } from "../ui/pages/ConnectionDetails";

const AuthenticatedRoute: React.FC<RouteProps> = (props) => {
  const authentication = useAppSelector(getAuthentication);
  const location = useLocation();

  return authentication.loggedIn ? (
    <Route
      {...props}
      component={props.component}
    />
  ) : (
    <Redirect
      from={location.pathname}
      to={{
        pathname: RoutePath.PASSCODE_LOGIN,
      }}
    />
  );
};

const Routes = () => {
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
        <AuthenticatedRoute
          path={RoutePath.CONNECTION_DETAILS}
          exact
          component={ConnectionDetails}
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
            />
          );
        })}
        <AuthenticatedRoute
          path="/tabs/identifiers/:id"
          component={IdentifierDetails}
          exact
        />
        <AuthenticatedRoute
          path="/tabs/creds/:id"
          component={CredentialDetails}
          exact
        />
        <Redirect
          exact
          from="/"
          to={TabsRoutePath.IDENTIFIERS}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export { Routes, RoutePath };
