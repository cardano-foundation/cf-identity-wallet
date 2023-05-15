import React from "react";
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router";
import {
  idCardOutline,
  fingerPrintOutline,
  scanOutline,
  chatbubbleOutline,
  walletOutline,
} from "ionicons/icons";
import { Dids } from "../../pages/Dids";
import { Creds } from "../../pages/Creds";
import { Crypto } from "../../pages/Crypto";
import { Scan } from "../../pages/Scan";
import { Chat } from "../../pages/Chat";

const Tabs = () => {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect
            exact
            path="/tabs"
            to="/tabs/dids"
          />
          <Route
            path="/tabs/dids"
            render={() => <Dids />}
            exact={true}
          />
          <Route
            path="/tabs/creds"
            render={() => <Creds />}
            exact={true}
          />
          <Route
            path="/tabs/scan"
            render={() => <Scan />}
            exact={true}
          />
          <Route
            path="/tabs/crypto"
            render={() => <Crypto />}
            exact={true}
          />
          <Route
            path="/tabs/chat"
            render={() => <Chat />}
            exact={true}
          />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton
            tab="dids"
            href="/tabs/dids"
          >
            <IonIcon icon={idCardOutline} />
            <IonLabel>Dids</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="creds"
            href="/tabs/creds"
          >
            <IonIcon icon={fingerPrintOutline} />
            <IonLabel>Creds</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="scan"
            href="/tabs/scan"
          >
            <IonIcon icon={scanOutline} />
            <IonLabel>Scan</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="crypto"
            href="/tabs/crypto"
          >
            <IonIcon icon={walletOutline} />
            <IonLabel>Crypto</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="chat"
            href="/tabs/chat"
          >
            <IonIcon icon={chatbubbleOutline} />
            <IonLabel>Chat</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export { Tabs };
