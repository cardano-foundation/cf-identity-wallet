import {Store as PullStateStore} from 'pullstate';

const Store = new PullStateStore({
  account: {},
  cache: {
    path: '/',
    payload: {},
  },
  settings: {
    language: 'English',
    currentAccount: '',
    darkTheme: false,
    network: 'preprod',
  },
});

export default Store;
