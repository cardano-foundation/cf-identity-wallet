import React from 'react';
import Dids from '../components/navigation/tab-menu/Dids/Dids';
import Credentials from '../components/navigation/tab-menu/Credentials/Credentials';
import Scan from '../components/navigation/tab-menu/Scan/Scan';
import Crypto from '../components/navigation/tab-menu/Crypto/Crypto';
import Chats from '../components/navigation/tab-menu/Chat/Chats';
import {
  idCardOutline,
  fingerPrintOutline,
  scanOutline,
  chatbubbleOutline,
  walletOutline,
} from 'ionicons/icons';
import TabMenu from '../components/navigation/tab-menu/TabMenu';

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

export const Tabs = () => (
  <TabMenu
    tabs={tabRoutes}
    position="bottom"
  />
);
