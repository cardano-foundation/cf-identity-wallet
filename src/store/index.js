import {Store as PullStateStore} from 'pullstate';

const Store = new PullStateStore({
  safeAreaTop: 0,
  safeAreaBottom: 0,
  menuOpen: false,
  notificationsOpen: false,
  currentPage: null,
  account: {},
  platform: '',
  router: {
    currentPath: '/',
    history: [],
  },
  settings: {
    language: 'English',
    currentAccount: 1,
    enableNotifications: false,
    darkTheme: false,
    network: 'preprod',
  },
});

export default Store;
