import React from 'react';
import {IonRouterOutlet, IonSplitPane} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {Redirect, Route} from 'react-router-dom';
import SideMenu from '../components/navigation/side-menu/SideMenu';
import Chat from '../components/navigation/tab-menu/Chat/Chat';
import {tabRoutes, Tabs} from './tabRoutes';
import CreateWallet from '../components/pages/CreateWallet';
import RecoverySeedPhrase from '../components/pages/RecoverySeedPhrase';
import VerifySeedPhrase from '../components/pages/VerifySeedPhrase';
import FaceIdSetup from '../components/pages/FaceIdSetup';
import TermsAndConditions from '../components/pages/TermsAndConditions';
import Did from '../components/pages/Did';
import CredentialDetails from '../components/pages/CredentialDetails';
import UpcomingFeatures from '../components/pages/UpcomingFeatures';

const Routes = () => {
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
            path="/did/:did_id"
            render={() => <Did />}
          />
          <Route
            path="/creds/:cred_id"
            render={() => <CredentialDetails />}
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
            path="/verifyseedphrase"
            render={() => <VerifySeedPhrase />}
          />
          <Route
            path="/termsandconditions"
            render={() => <TermsAndConditions />}
          />
          <Route
            path="/faceidsetup"
            render={() => <FaceIdSetup />}
          />
          <Route
            path="/chat/:channel_id"
            render={() => <Chat />}
          />
          <Route
            path="/upcomingfeatures"
            render={() => <UpcomingFeatures />}
          />
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

export default Routes;
