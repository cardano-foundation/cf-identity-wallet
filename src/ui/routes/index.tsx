import React from "react";
import { IonReactRouter } from "@ionic/react-router";
import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router-dom";
import Home from "../pages/Home";

const Routes = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route
          path="/"
          exact
          component={Home}
        />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

export default Routes;
