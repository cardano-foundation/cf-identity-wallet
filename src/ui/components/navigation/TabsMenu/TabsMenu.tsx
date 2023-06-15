import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from "@ionic/react";
import { Route, Redirect } from "react-router";
import {
  idCardOutline,
  fingerPrintOutline,
  scanOutline,
  chatbubbleOutline,
  walletOutline,
} from "ionicons/icons";
import React from "react";
import { i18n } from "../../../../i18n";
import "./TabsMenu.scss";
import { TabsRoutePath } from "../../../../routes/paths";

const TabsMenu = ({tab, path}:{tab: React.ComponentType<any>, path:string}) => {
  return (
    <IonTabs>
      <IonRouterOutlet animated={false}>
        <Redirect
          exact
          from={TabsRoutePath.ROOT}
          to={TabsRoutePath.DIDS}
        />
        <Route
          path={path}
          component={tab}
          exact={true}
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
  );
};

export { TabsMenu, TabsRoutePath };
