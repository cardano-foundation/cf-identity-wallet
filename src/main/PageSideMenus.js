import {
  archiveOutline,
  beerOutline,
  cardOutline,
  clipboardOutline,
  eyeOutline,
  golfOutline,
  layersOutline,
  logOutOutline,
  mailOutline,
  mailUnreadOutline,
  mapOutline,
  personOutline,
  pulseOutline,
  refreshOutline,
  restaurantOutline,
  chatbubbleOutline,
} from 'ionicons/icons';
import {buildSideMenuObject} from './Utils';

export const tab1SideMenu = [
  buildSideMenuObject(
    false,
    'Stuff',
    'Check some stuff',
    layersOutline,
    '/stuff'
  ),
  buildSideMenuObject(
    false,
    'Payments',
    'Pay and get paid',
    cardOutline,
    '/payments'
  ),
  buildSideMenuObject(true),
  buildSideMenuObject(
    false,
    'Chats',
    'Opens chats page',
    chatbubbleOutline,
    '/chats'
  ),
  buildSideMenuObject(
    false,
    'Template',
    'Opens generic template page',
    clipboardOutline,
    '/template'
  ),
  buildSideMenuObject(false, 'Privacy', 'Boring stuff', eyeOutline, null),
  buildSideMenuObject(false, 'Logout', 'See ya later!', logOutOutline, null),
];

export const tab2SideMenu = [
  buildSideMenuObject(
    false,
    'Profile',
    'Navigates to Profile page',
    personOutline,
    '/tabs/tab1'
  ),
  buildSideMenuObject(
    false,
    'Places',
    'Navigates to Places page',
    mapOutline,
    '/tabs/tab3'
  ),
  buildSideMenuObject(true),
  buildSideMenuObject(false, 'Unread', null, mailUnreadOutline, null),
  buildSideMenuObject(false, 'Archived', null, archiveOutline, null),
  buildSideMenuObject(
    false,
    'Timestamp style',
    'Changes the style of the timestamp',
    refreshOutline,
    null
  ),
];

export const tab3SideMenu = [
  buildSideMenuObject(
    false,
    'Profile',
    'Navigates to Profile page',
    personOutline,
    '/tabs/tab1'
  ),
  buildSideMenuObject(
    false,
    'Inbox',
    'Navigates to Inbox page',
    mailOutline,
    '/tabs/tab2'
  ),
  buildSideMenuObject(true),
  buildSideMenuObject(false, 'Pubs', null, beerOutline, null),
  buildSideMenuObject(false, 'Restaurants', null, restaurantOutline, null),
  buildSideMenuObject(false, 'Golf Courses', null, golfOutline, null),
  buildSideMenuObject(false, 'Hospitals', null, pulseOutline, null),
];
