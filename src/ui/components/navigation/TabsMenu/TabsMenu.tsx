import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { Redirect, Route } from "react-router";
import {
  notifications,
  notificationsOutline,
  fingerPrint,
  fingerPrintOutline,
  idCard,
  idCardOutline,
  scan,
  scanOutline,
  apps,
  appsOutline,
} from "ionicons/icons";
import { ComponentType, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { i18n } from "../../../../i18n";
import "./TabsMenu.scss";
import { RoutePath, TabsRoutePath } from "../../../../routes/paths";
import { Identifiers } from "../../../pages/Identifiers";
import { Creds } from "../../../pages/Credentials";
import { Scan } from "../../../pages/Scan";
import { Chat } from "../../../pages/Chat";
import { Menu } from "../../../pages/Menu";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getStateCache,
  removeCurrentRoute,
  setCurrentRoute,
} from "../../../../store/reducers/stateCache";
import { getNextRootRoute } from "../../../../routes/nextRoute";
import { useAppIonRouter } from "../../../hooks";

const tabsRoutes = [
  {
    label: i18n.t("tabsmenu.label.identifiers"),
    path: TabsRoutePath.IDENTIFIERS,
    component: Identifiers,
    icon: [fingerPrint, fingerPrintOutline],
  },
  {
    label: i18n.t("tabsmenu.label.creds"),
    path: TabsRoutePath.CREDENTIALS,
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
    label: i18n.t("tabsmenu.label.notification"),
    path: TabsRoutePath.NOTIFICATION,
    component: Chat,
    icon: [notifications, notificationsOutline],
  },
  {
    label: i18n.t("tabsmenu.label.menu"),
    path: TabsRoutePath.MENU,
    component: Menu,
    icon: [apps, appsOutline],
  },
];
const TabsMenu = ({ tab, path }: { tab: ComponentType; path: string }) => {
  const stateCache = useAppSelector(getStateCache);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleTabClick = (tabPath: string) => {
    dispatch(setCurrentRoute({ path: tabPath }));
  };

  const exactPath = getNextRootRoute({ store: { stateCache: stateCache } });

  if (exactPath.pathname !== RoutePath.TABS_MENU) {
    return <Redirect to={exactPath.pathname} />;
  }

  return (
    <IonTabs>
      <IonRouterOutlet animated={false}>
        <Redirect
          exact
          from={TabsRoutePath.ROOT}
          to={TabsRoutePath.IDENTIFIERS}
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
              data-testid={
                "tab-button-" + tab.label.toLowerCase().replace(/\s/g, "-")
              }
              onClick={() => {
                handleTabClick(tab.path);
              }}
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
