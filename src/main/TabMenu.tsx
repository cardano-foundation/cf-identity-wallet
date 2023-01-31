import React from 'react';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonRouterOutlet,
} from '@ionic/react';
import {Route} from 'react-router-dom';
import './TabMenu.css';

const TabMenu = (props) => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        {props.tabs.map((tab, i) => {
          const TabComponent = tab.component;
          if (tab.isTab) {
            return (
              <Route
                key={`tab_route_${i}`}
                path={tab.path}
                render={(props) => (
                  <TabComponent
                    {...props}
                    sideMenu={tab.sideMenu ? true : false}
                    sideMenuOptions={
                      tab.sideMenuOptions ? tab.sideMenuOptions : false
                    }
                  />
                )}
                exact={true}
              />
            );
          } else {
            return (
              <Route
                key={`child_tab_route_${i}`}
                path={tab.path}
                render={(props) => (
                  <TabComponent
                    {...props}
                    sideMenu={tab.sideMenu ? true : false}
                    sideMenuOptions={
                      tab.sideMenuOptions ? tab.sideMenuOptions : false
                    }
                  />
                )}
                exact={false}
              />
            );
          }
        })}
      </IonRouterOutlet>

      <IonTabBar
        slot={props.position}
        color="dark">
        {props.tabs.map((tab, i) => {
          if (tab.isTab) {
            return (
              <IonTabButton
                key={`tab_button_${i + 1}`}
                tab={`tab_${i + 1}`}
                href={tab.path}>
                <IonIcon icon={tab.icon} />
                {tab.label && <IonLabel>{tab.label}</IonLabel>}
              </IonTabButton>
            );
          }
        })}
      </IonTabBar>
    </IonTabs>
  );
};

export default TabMenu;
