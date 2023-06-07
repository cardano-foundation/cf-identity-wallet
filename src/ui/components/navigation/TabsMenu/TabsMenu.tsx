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
import { TabsRoutePath } from "../../../../routes/paths";
import { CardDetails } from "../../../pages/CardDetails";
const TabsMenu = () => {
  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet animated={false}>
          <Redirect
            exact
            path={TabsRoutePath.ROOT}
            to={TabsRoutePath.DIDS}
          />
          <Route
            path={TabsRoutePath.DIDS}
            component={Dids}
            exact={true}
          />
          <Route
            path={TabsRoutePath.CREDS}
            component={Creds}
            exact={true}
          />
          <Route
            path={TabsRoutePath.SCAN}
            component={Scan}
            exact={true}
          />
          <Route
            path={TabsRoutePath.CRYPTO}
            component={Crypto}
            exact={true}
          />
          <Route
            path={TabsRoutePath.CHAT}
            component={Chat}
            exact={true}
          />
          <Route
            path="/tabs/dids/:id"
            component={CardDetails}
          />
        </IonRouterOutlet>

        <IonTabBar
          slot="bottom"
          data-testid="tabs-menu"
        >
          <IonTabButton
            tab="dids"
            href={TabsRoutePath.DIDS}
          >
            <div className="borderTop" />
            <IonIcon icon={fingerPrintOutline} />
            <IonLabel>{i18n.t("tabsmenu.label.dids")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="creds"
            href={TabsRoutePath.CREDS}
          >
            <div className="borderTop" />
            <IonIcon icon={idCardOutline} />
            <IonLabel>{i18n.t("tabsmenu.label.creds")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="scan"
            href={TabsRoutePath.SCAN}
          >
            <div className="borderTop" />
            <IonIcon icon={scanOutline} />
            <IonLabel>{i18n.t("tabsmenu.label.scan")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="crypto"
            href={TabsRoutePath.CRYPTO}
          >
            <div className="borderTop" />
            <IonIcon icon={walletOutline} />
            <IonLabel>{i18n.t("tabsmenu.label.crypto")}</IonLabel>
          </IonTabButton>

          <IonTabButton
            tab="chat"
            href={TabsRoutePath.CHAT}
          >
            <div className="borderTop" />
            <IonIcon icon={chatbubbleOutline} />
            <IonLabel>{i18n.t("tabsmenu.label.chat")}</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export { TabsMenu, TabsRoutePath };
