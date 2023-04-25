import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";

const ONBOARDING_ROUTE = "/onboarding";
const SET_PASSCODE_ROUTE = "/setpasscode";
const PASSCODE_LOGIN_ROUTE = "/passcodelogin";
const GENERATE_SEED_PHRASE_ROUTE = "/generateseedphrase";

const Routes = ({ storedPasscode }: { storedPasscode: string }) => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          path="/"
          exact
          component={storedPasscode ? PasscodeLogin : Onboarding}
        />
        <Route
          path={ONBOARDING_ROUTE}
          exact
          component={Onboarding}
        />
        <Route
          path={SET_PASSCODE_ROUTE}
          exact
          component={SetPasscode}
        />
        <Route
          path={PASSCODE_LOGIN_ROUTE}
          exact
          component={PasscodeLogin}
        />
        <Route
          path={GENERATE_SEED_PHRASE_ROUTE}
          exact
          component={GenerateSeedPhrase}
        />
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
