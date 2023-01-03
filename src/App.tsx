import React, { useRef, useState } from 'react';
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonSplitPane,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import Menu from './components/Menu';
import TabMenu from './routes/TabMenu';
import All from './screens/All';
import ActionSheet from './screens/ActionSheet';
import Alert from './screens/Alert';
import Chats from './screens/Chats';
import Chat from './screens/Chat';
import Loading from './screens/Loading';
import Modal from './screens/Modal';
import Picker from './screens/Picker';
import Popover from './screens/Popover';
import Toast from './screens/Toast';

import {
  addCircle,
  addCircleOutline,
  chatbubble,
  home,
  homeOutline,
  notifications,
  notificationsOutline,
  person,
  personOutline,
  search,
  searchOutline,
} from 'ionicons/icons';

setupIonicReact();
/* Core CSS required for Ionic components to work properly */
import './theme/App.scss';

import './theme/variables.css';
import './theme/structure.css';
import './theme/custom-tab-bar.css';

export const Tabs = () => (
  <TabMenu
    tabs={[
      {
        label: 'Profile',
        component: ActionSheet,
        icon: personOutline,
        path: '/tabs/tab1',
        default: true,
        isTab: true,
        sideMenu: true,
        sideMenuOptions: false,
      },
    ]}
    position='bottom'
  />
);

const App = (isExtension?: boolean) => {
  const history = useHistory();

  if (isExtension && history) {
    console.log('isExtension44');
    console.log(window.location.pathname);
    history.push('/');
  }

  console.log('window.location.pathname2');
  console.log(window.location.pathname);

  const pages = [
    {
      label: 'Tabs',
      url: '/tabs',
      component: Tabs,
    },

    {
      label: 'All',
      url: '/overlay/all',
      component: All,
    },
    {
      label: 'Action Sheet',
      url: '/overlay/action-sheet',
      component: ActionSheet,
    },
    {
      label: 'Alert',
      url: '/overlay/alert',
      component: Alert,
    },
    {
      label: 'Chats',
      url: '/chats',
      component: Chats,
    },
    {
      label: 'Loading',
      url: '/overlay/loading',
      component: Loading,
    },
    {
      label: 'Modal',
      url: '/overlay/modal',
      component: Modal,
    },
    {
      label: 'Picker',
      url: '/overlay/picker',
      component: Picker,
    },
    {
      label: 'Popover',
      url: '/overlay/popover',
      component: Popover,
    },
    {
      label: 'Toast',
      url: '/overlay/toast',
      component: Toast,
    },
  ];

  const tabs = [
    {
      name: 'Home',
      url: '/home',
      activeIcon: home,
      icon: homeOutline,
      component: All,
    },
    {
      name: 'Search',
      url: '/search',
      activeIcon: search,
      icon: searchOutline,
      component: ActionSheet,
    },
    {
      name: 'Add',
      url: '/add',
      activeIcon: addCircle,
      icon: addCircleOutline,
      component: Alert,
    },
    {
      name: 'Account',
      url: '/account',
      activeIcon: person,
      icon: personOutline,
      component: Loading,
    },
    {
      name: 'Notifications',
      url: '/notifications',
      activeIcon: notifications,
      icon: notificationsOutline,
      component: Modal,
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].name);

  const useIsMounted = () => {
    const isMounted = useRef(false);
    // @ts-ignore
    useEffect(() => {
      isMounted.current = true;
      return () => (isMounted.current = false);
    }, []);
    return isMounted;
  };

  const isMounted = useIsMounted();

  useEffect(() => {
    const init = async () => {};
    if (isMounted.current) {
      // call the function
      init()
        // make sure to catch any error
        .catch(console.error);
    }
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId='main'>
          hellooooo
          <Menu pages={pages} />
          {/*

                    */}
          <IonRouterOutlet id='main'>
            <Route path='/' exact={true}>
              <Redirect to='/overlay/all' />
            </Route>
            <Route path='/tabs' render={() => <Tabs />} />
            <Route path='/chats' render={() => <Chats />} />
            <Route path='/view-chat/:contact_id' render={() => <Chat />} />

            {pages.map((page, index) => {
              const pageComponent = page.component;

              return (
                <Route
                  key={index}
                  path={page.url}
                  exact={true}
                  component={pageComponent}
                />
              );
            })}
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
