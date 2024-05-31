import React, { useEffect } from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { VerifySeedPhrase } from "../ui/pages/VerifySeedPhrase";
import { CreatePassword } from "../ui/pages/CreatePassword";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getRoutes,
  getStateCache,
  setCurrentRoute,
} from "../store/reducers/stateCache";
import { getNextRoute } from "./nextRoute";
import { TabsMenu, tabsRoutes } from "../ui/components/navigation/TabsMenu";
import { RoutePath, TabsRoutePath } from "./paths";
import { IdentifierDetails } from "../ui/pages/IdentifierDetails";
import { CredentialDetails } from "../ui/pages/CredentialDetails";
import { ConnectionDetails } from "../ui/pages/ConnectionDetails";

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
          path={RoutePath.SET_PASSCODE}
          component={SetPasscode}
          exact
        />

        <Route
          path={RoutePath.ONBOARDING}
          component={Onboarding}
          exact
        />

        <Route
          path={RoutePath.GENERATE_SEED_PHRASE}
          component={GenerateSeedPhrase}
          exact
        />

        <Route
          path={RoutePath.VERIFY_SEED_PHRASE}
          component={VerifySeedPhrase}
          exact
        />

        <Route
          path={RoutePath.TABS_MENU}
          component={TabsMenu}
          exact
        />

        <Route
          path={RoutePath.CREATE_PASSWORD}
          component={CreatePassword}
          exact
        />

        <Route
          path={RoutePath.CONNECTION_DETAILS}
          component={ConnectionDetails}
          exact
        />

        {tabsRoutes.map((tab, index: number) => {
          return (
            <Route
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
        <Route
          path={TabsRoutePath.IDENTIFIER_DETAILS}
          component={IdentifierDetails}
          exact
        />
        <Route
          path={TabsRoutePath.CREDENTIAL_DETAILS}
          component={CredentialDetails}
          exact
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
