import {PreferencesAPI} from '../../db/preferences';

export const CacheAPI = {
  table: 'app.cache',
  path: '/',
  payload: {},
  accountId: '',
  accounts: [],

  async init() {
    const cache = await PreferencesAPI.get(this.table);
    if (!cache) return;
    this.path = cache.path;
    this.payload = cache.payload;
    this.accountId = cache.accountId;
    this.accounts = cache.accounts;
  },
  set setPath(path: string) {
    this.path = path;
  },
  set setPayload(payload: string) {
    this.payload = payload;
  },
  set setAccountId(accountId: string) {
    this.accountId = accountId;
  },
  set setAccounts(accountId: string) {
    this.accountId = accountId;
  },
  get() {
    return {
      path: this.path,
      payload: this.payload,
      accountId: this.accountId,
      accounts: this.accounts,
    };
  },
  async commit() {
    await PreferencesAPI.set(this.table, {
      path: this.path,
      payload: this.payload,
      accountId: this.accountId,
    });
  },
};
