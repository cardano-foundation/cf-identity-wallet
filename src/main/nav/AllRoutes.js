import React from 'react';
//	Main Tabs
import Dids from '../../components/Tabs/Dids/Dids';
import Credentials from '../../components/Tabs/Credentials/Credentials';
import Scan from '../../components/Tabs/Scan/Scan';
import Crypto from '../../components/Tabs/Crypto/Crypto';
import Chats from '../../components/Tabs/Chat/Chats';
import {
  idCardOutline,
  fingerPrintOutline,
  scanOutline,
  chatbubbleOutline,
  walletOutline,
} from 'ionicons/icons';

//  Import custom tab menu
import TabMenu from '../TabMenu';
import SubRoutes from './SubRoutes';

//	Array of objects representing tab pages
//  These will be the main tabs across the app

//  *   PARAMS per tab object   *
//  isTab = true will make the tab appear
//  default = the default tab page to open and be redirected to at "/"
//  NOTE: there should only be one default tab (default: true)
//  label = the label to show with the tab
//  component = the component related to this tab page
//  icon = icon to show on the tab bar menu
//  path = the path which the tab is accessible
export const tabRoutes = [
  {
    label: 'DIDs',
    component: Dids,
    customIcon: false,
    icon: fingerPrintOutline,
    path: '/tabs/dids',
    default: true,
    isTab: true,
    sideMenu: true,
  },
  {
    label: 'Creds',
    component: Credentials,
    customIcon: false,
    icon: idCardOutline,
    path: '/tabs/credentials',
    default: false,
    isTab: true,
    sideMenu: true,
  },
  {
    label: 'Scan',
    component: Scan,
    customIcon: false,
    icon: scanOutline,
    path: '/tabs/scan',
    default: false,
    isTab: true,
    sideMenu: true,
  },
  {
    label: 'Crypto',
    component: Crypto,
    customIcon: false,
    icon: walletOutline,
    path: '/tabs/crypto',
    default: false,
    isTab: true,
    sideMenu: true,
  },
  {
    label: 'Chat',
    component: Chats,
    customIcon: false,
    icon: chatbubbleOutline,
    path: '/tabs/chats',
    default: false,
    isTab: true,
    sideMenu: true,
  },
];

//  Array of objects representing children pages of tabs

//  *   PARAMS per tab object   *
//  isTab = should always be set to false for these
//  component = the component related to this tab page
//  path = the path which the tab is accessible

//  These pages should be related to tab pages and be held within the same path
//  E.g. /tabs/tab1/child
const tabChildrenRoutes = [
  // {component: InboxItem, path: '/tabs/tab3/:id', isTab: false},
];

//  Array of objects representing sub pages

//  *   PARAMS per tab object   *
//  component = the component related to this sub page
//  path = the path which the sub page is accessible

//  This array should be sub pages which are not directly related to a tab page
//  E.g. /child
const subPageRoutes = [
  // {component: Settings, path: '/settings'}
];

//  Let's combine these together as they need to be controlled within the same IonRouterOutlet
const tabsAndChildrenRoutes = [...tabRoutes, ...tabChildrenRoutes];

//  Render sub routes
export const SubPages = () => <SubRoutes routes={subPageRoutes} />;

//	Render tab menu
export const Tabs = () => (
  <TabMenu
    tabs={tabsAndChildrenRoutes}
    position="bottom"
  />
);
