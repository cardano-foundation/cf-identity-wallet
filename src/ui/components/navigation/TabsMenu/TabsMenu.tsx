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
  idCard,
  idCardOutline,
  fingerPrint,
  fingerPrintOutline,
  scan,
  scanOutline,
  chatbubble,
  chatbubbleOutline,
  wallet,
  walletOutline,
} from "ionicons/icons";
import React from "react";
import { useLocation } from "react-router-dom";
import { i18n } from "../../../../i18n";
import "./TabsMenu.scss";
import { TabsRoutePath } from "../../../../routes/paths";
import { Dids } from "../../../pages/Dids";
import { Creds } from "../../../pages/Creds";
import { Scan } from "../../../pages/Scan";
import { Chat } from "../../../pages/Chat";
import { CryptoPlaceholder } from "../../../pages/CryptoPlaceholder/CryptoPlaceholder";

const tabsRoutes = [
  {
    label: i18n.t("tabsmenu.label.dids"),
    path: TabsRoutePath.DIDS,
    component: Dids,
    icon: [fingerPrint, fingerPrintOutline],
  },
  {
    label: i18n.t("tabsmenu.label.creds"),
    path: TabsRoutePath.CREDS,
    component: Creds,
    icon: [idCard, idCardOutline],
  },
  {
    label: i18n.t("tabsmenu.label.scan"),
    path: TabsRoutePath.SCAN,
    component: Scan,
    icon: [scan, scanOutline],
  },
  {
    label: i18n.t("tabsmenu.label.crypto"),
    path: TabsRoutePath.CRYPTO_PLACEHOLDER,
    component: CryptoPlaceholder,
    icon: [wallet, walletOutline],
  },
  {
    label: i18n.t("tabsmenu.label.chat"),
    path: TabsRoutePath.CHAT,
    component: Chat,
    icon: [chatbubble, chatbubbleOutline],
  },
];
const TabsMenu = ({
  tab,
  path,
}: {
  tab: React.ComponentType;
  path: string;
}) => {
  const location = useLocation();
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
        {tabsRoutes.map((tab, index: number) => {
          return (
            <IonTabButton
              key={`${tab.label}-${index}`}
              tab={tab.label}
              href={tab.path}
            >
              <div className="border-top" />
              <IonIcon
                icon={
                  tab.path === location.pathname ? tab.icon[0] : tab.icon[1]
                }
              />
              <IonLabel>{tab.label}</IonLabel>
            </IonTabButton>
          );
        })}
      </IonTabBar>
    </IonTabs>
  );
};

export { TabsMenu, TabsRoutePath, tabsRoutes };
