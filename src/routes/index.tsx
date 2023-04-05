import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";
import { Onboarding } from "../ui/pages/Onboarding";

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
          path="/onboarding"
          component={Onboarding}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default Routes;
