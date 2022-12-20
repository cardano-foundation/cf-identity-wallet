import { IonRouterOutlet, IonSplitPane } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";
import { SubPages, Tabs, tabRoutes } from "./AllRoutes";
import Menu from "../components/Menu";

const NavRoutes = () => {

    return (
        <IonReactRouter>
            <IonSplitPane contentId="main">

                <Menu />

                <IonRouterOutlet id="main">

                    <Route path="/tabs" render={ () => <Tabs />} />
                    <SubPages />

                    <Route path="/" component={ tabRoutes.filter(t => t.default)[0].component } exact={ true } />
                    <Redirect exact from="/" to={ tabRoutes.filter(t => t.default)[0].path.toString() }/>
                </IonRouterOutlet>
            </IonSplitPane>
        </IonReactRouter>
    );
}

export default NavRoutes;
