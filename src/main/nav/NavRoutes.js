import React from 'react';
import {IonRouterOutlet, IonSplitPane} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {Redirect, Route} from 'react-router-dom';
import SideMenu from '../SideMenu';
import Chat from '../../components/Chat/Chat';
import Template from '../../pages/Template';
import Payments from '../../pages/Payments';
import Stuff from '../../pages/Stuff';
import {SubPages, tabRoutes, Tabs} from './AllRoutes';
import Chats from '../../components/Chat/Chats';
import CreateWallet from '../../pages/CreateWallet';
import RecoverySeedPhrase from '../../pages/RecoverySeedPhrase';
import FaceIdSetup from '../../pages/FaceIdSetup';
import TermsAndConditions from '../../pages/TermsAndConditions';

const NavRoutes = () => {
  return (
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <SideMenu />

        <IonRouterOutlet id="main">
          <Route
              path="/api/tabs"
              render={() => <Tabs/>}
          />
          <Route
              path="/api/createwallet"
              render={() => <CreateWallet/>}
          />
          <Route
              path="/api/recoveryseedphrase"
              render={() => <RecoverySeedPhrase/>}
          />
          <Route
              path="/api/termsandconditions"
              render={() => <TermsAndConditions/>}
          />
          <Route
              path="/api/faceidsetup"
              render={() => <FaceIdSetup/>}
          />
          <Route
              path="/api/template"
              render={() => <Template/>}
          />
          <Route
              path="/api/payments"
              render={() => <Payments/>}
          />
          <Route
              path="/api/stuff"
              render={() => <Stuff/>}
          />
          <Route
              path="/api/chats"
              render={() => <Chats/>}
          />
          <Route
              path="/api/chat/:channel_id"
              render={() => <Chat/>}
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
