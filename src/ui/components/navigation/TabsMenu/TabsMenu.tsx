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
import { i18n } from "../../../../i18n";
import "./TabsMenu.scss";
import { Dids } from "../../../pages/Dids";
import { Creds } from "../../../pages/Creds";
import { Crypto } from "../../../pages/Crypto";
import { Scan } from "../../../pages/Scan";
import { Chat } from "../../../pages/Chat";

enum TabsRoutePath {
  ROOT = "/tabs",
  DIDS = "/tabs/dids",
  CREDS = "/tabs/creds",
  SCAN = "/tabs/scan",
  CRYPTO = "/tabs/crypto",
  CHAT = "/tabs/chat",
}

const TabsMenu = () => {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Redirect
            exact
            path={TabsRoutePath.ROOT}
            to={TabsRoutePath.DIDS}
          />
          <Route
            path={TabsRoutePath.DIDS}
            render={() => <Dids />}
            exact={true}
          />
          <Route
            path={TabsRoutePath.CREDS}
            render={() => <Creds />}
            exact={true}
          />
          <Route
            path={TabsRoutePath.SCAN}
            render={() => <Scan />}
            exact={true}
          />
          <Route
            path={TabsRoutePath.CRYPTO}
            render={() => <Crypto />}
            exact={true}
          />
          <Route
            path={TabsRoutePath.CHAT}
            render={() => <Chat />}
            exact={true}
          />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton
            tab="dids"
            href={TabsRoutePath.DIDS}
          >
            <IonIcon icon={fingerPrintOutline} />
            <IonLabel>{i18n.t("tabs.label.dids")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="creds"
            href={TabsRoutePath.CREDS}
          >
            <IonIcon icon={idCardOutline} />
            <IonLabel>{i18n.t("tabs.label.creds")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="scan"
            href={TabsRoutePath.SCAN}
          >
            <IonIcon icon={scanOutline} />
            <IonLabel>{i18n.t("tabs.label.scan")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="crypto"
            href={TabsRoutePath.CRYPTO}
          >
            <IonIcon icon={walletOutline} />
            <IonLabel>{i18n.t("tabs.label.crypto")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="chat"
            href={TabsRoutePath.CHAT}
          >
            <IonIcon icon={chatbubbleOutline} />
            <IonLabel>{i18n.t("tabs.label.chat")}</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export { TabsMenu, TabsRoutePath };
