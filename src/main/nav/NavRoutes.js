import React from 'react';
import {IonRouterOutlet, IonSplitPane} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {Redirect, Route} from 'react-router-dom';
import SideMenu from '../SideMenu';
import Chat from '../../components/Chat/Chat';
import Template from '../../pages/Template';
import Payments from '../../pages/Payments';
import Stuff from '../../pages/Stuff';
import {SubPages, Tabs, tabRoutes} from './AllRoutes';
import Chats from '../../components/Chat/Chats';
import CreateWallet from '../../pages/CreateWallet';
import RecoverySeedPhrase from '../../pages/RecoverySeedPhrase';
import FaceIdSetup from '../../pages/FaceIdSetup';

const NavRoutes = () => {
  return (
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <SideMenu />

        <IonRouterOutlet id="main">
          <Route
            path="/tabs"
            render={() => <Tabs />}
          />
          <Route
            path="/createwallet"
            render={() => <CreateWallet />}
          />
          <Route
            path="/recoveryseedphrase"
            render={() => <RecoverySeedPhrase />}
          />
          <Route
            path="/faceidsetup"
            render={() => <FaceIdSetup />}
          />
          <Route
            path="/template"
            render={() => <Template />}
          />
          <Route
            path="/payments"
            render={() => <Payments />}
          />
          <Route
            path="/stuff"
            render={() => <Stuff />}
          />
          <Route
            path="/chats"
            render={() => <Chats />}
          />
          <Route
            path="/chat/:channel_id"
            render={() => <Chat />}
          />
          <SubPages />

          <Route
            path="/"
            component={tabRoutes.filter((t) => t.default)[0].component}
            exact={true}
          />
          <Redirect
            exact
            from="/"
            to={tabRoutes.filter((t) => t.default)[0].path.toString()}
          />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

export default NavRoutes;
