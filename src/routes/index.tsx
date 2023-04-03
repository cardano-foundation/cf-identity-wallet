import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";
import Home from "../ui/pages/Home";
import GenerateSeedPhrase from "../ui/components/GenerateSeedPhrase";

const Routes = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          path="/"
          exact
          component={Home}
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
