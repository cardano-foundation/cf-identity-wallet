import { useEffect, useState } from "react";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode/SetPasscode";
import { PasscodeLogin } from "../ui/pages/PasscodeLogin";

const ONBOARDING_ROUTE = "/onboarding";
const SET_PASSCODE_ROUTE = "/setpasscode";
const PASSCODE_LOGIN_ROUTE = "/passcodelogin";
const GENERATE_SEED_PHRASE_ROUTE = "/generateseedphrase";

const Routes = () => {
  const [storedPasscode, setStoredPasscode] = useState("");

  useEffect(() => {
    async function getStoredPasscode() {
      const loginPasscode = await SecureStorage.get("app-login-passcode");
      loginPasscode && setStoredPasscode(`${loginPasscode}`);
    }
    getStoredPasscode();
  }, [storedPasscode]);

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Redirect
          exact
          from="/"
          to={storedPasscode ? PASSCODE_LOGIN_ROUTE : ONBOARDING_ROUTE}
        />
        <Route
          path={ONBOARDING_ROUTE}
          component={Onboarding}
        />
        <Route
          path={SET_PASSCODE_ROUTE}
          component={SetPasscode}
        />
        <Route
          path={PASSCODE_LOGIN_ROUTE}
          render={(props) => (
            <PasscodeLogin
              {...props}
              storedPasscode={storedPasscode}
            />
          )}
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
