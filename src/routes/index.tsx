import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";
import { GenerateSeedPhrase } from "../ui/pages/GenerateSeedPhrase";
import { SetPasscode } from "../ui/pages/SetPasscode/SetPasscode";

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
          path="/setpasscode"
          exact
          component={SetPasscode}
        />
        <Route
          path="/generateseedphrase"
          render={() => <GenerateSeedPhrase />}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default Routes;
