import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";

const PASSCODE_LOGIN = "/passcodelogin";
const PASSCODE_ROUTE = "/setpasscode";
const GENERATE_SEED_PHRASE_ROUTE = "/generateseedphrase";

const Routes = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          path="/"
          exact
          component={Onboarding}
        />
        <Route
          path={PASSCODE_ROUTE}
          exact
          component={SetPasscode}
        />
        <Route
          path={PASSCODE_LOGIN}
          exact
          component={PasscodeLogin}
        />
        <Route
          path={GENERATE_SEED_PHRASE_ROUTE}
          render={() => <GenerateSeedPhrase />}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export { Routes, PASSCODE_ROUTE, GENERATE_SEED_PHRASE_ROUTE };
