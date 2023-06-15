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
import {Dids} from "../../../pages/Dids";
import {Creds} from "../../../pages/Creds";
import {Scan} from "../../../pages/Scan";
import {Crypto} from "../../../pages/Crypto";
import {Chat} from "../../../pages/Chat";

const tabsRoutes = [
  {
    label: i18n.t("tabsmenu.label.dids"),
    path: TabsRoutePath.DIDS,
    component: Dids,
    icon: fingerPrintOutline
  },
  {
    label: i18n.t("tabsmenu.label.creds"),
    path: TabsRoutePath.CREDS,
    component: Creds,
    icon: idCardOutline
  },
  {
    label: i18n.t("tabsmenu.label.scan"),
    path: TabsRoutePath.SCAN,
    component: Scan,
    icon: scanOutline
  },
  {
    label: i18n.t("tabsmenu.label.crypto"),
    path: TabsRoutePath.CRYPTO,
    component: Crypto,
    icon: walletOutline
  },
  {
    label: i18n.t("tabsmenu.label.chat"),
    path: TabsRoutePath.CHAT,
    component: Chat,
    icon: chatbubbleOutline
  }
]
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
        {
          tabsRoutes.map((tab, index:number) => {
            return <IonTabButton
              key={`${tab.label}-${index}`}
              tab={tab.label}
              href={tab.path}
            >
              <div className="borderTop" />
              <IonIcon icon={tab.icon} />
              <IonLabel>{tab.label}</IonLabel>
            </IonTabButton>
          })
        }
      </IonTabBar>
    </IonTabs>
  );
};

export { TabsMenu, TabsRoutePath, tabsRoutes };
