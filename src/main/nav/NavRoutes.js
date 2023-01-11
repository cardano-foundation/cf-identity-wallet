import React from 'react';
import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import SideMenu from '../SideMenu';
import { SubPages, Tabs, tabRoutes } from './AllRoutes';

const NavRoutes = () => {
  return (
    <IonReactRouter>
      <IonSplitPane contentId='main'>
        <SideMenu />

        <IonRouterOutlet id='main'>
          <Route path='/tabs' render={() => <Tabs />} />
          <SubPages />

          <Route
            path='/'
            component={tabRoutes.filter((t) => t.default)[0].component}
            exact={true}
          />
          <Redirect
            exact
            from='/'
            to={tabRoutes.filter((t) => t.default)[0].path.toString()}
          />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

export default NavRoutes;
