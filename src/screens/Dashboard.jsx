import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { walletOutline, personOutline, settingsOutline } from 'ionicons/icons';
import { IonReactRouter } from '@ionic/react-router';
import Wallet from '../pages/Wallet';
import Identity from '../pages/Identity';
import Settings from '../pages/Settings';

const Dashboard = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonApp>
        <IonContent>
          <IonReactRouter>
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path='/wallet'>
                  <Wallet />
                </Route>
                <Route exact path='/identity'>
                  <Identity />
                </Route>
                <Route path='/settings'>
                  <Settings />
                </Route>
                <Route exact path='/'>
                  <Redirect to='/wallet' />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot='bottom'>
                <IonTabButton tab='wallet' href='/wallet'>
                  <IonIcon icon={walletOutline} />
                </IonTabButton>
                <IonTabButton tab='identity' href='/identity'>
                  <IonIcon icon={personOutline} />
                </IonTabButton>
                <IonTabButton tab='settings' href='/settings'>
                  <IonIcon icon={settingsOutline} />
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        </IonContent>
      </IonApp>
    </IonPage>
  );
};

export default Dashboard;
