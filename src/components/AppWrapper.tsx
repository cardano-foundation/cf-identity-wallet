import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import find from 'pouchdb-find';
PouchDB.plugin(find);
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));

import {CardanoAPI} from '../lib/CardanoAPI';
import {Account} from '../models/Account/Account';
import {useAppDispatch} from '../store/hooks';
import {CacheAPI} from '../models/Cache/CacheAPI';
import {SettingsAPI} from '../models/Settings/SettingsAPI';
import {setAccountsIdsInCache, setCache} from '../store/reducers/cache';
import {setSettings} from '../store/reducers/settings';
import {changeTheme, setDarkMode} from '../theme/helpers/theme-helper';
import {HandleConnect} from '../api/p2p/HandleConnect';
import {Database} from '../db/database';

export let handleConnect: HandleConnect | undefined = undefined;
export const pouchAPI: Database = new Database();

const AppWrapper = (props: {children: any}) => {
  const dispatch = useAppDispatch();

  const {t, i18n} = useTranslation();
  const [child, setChild] = useState(null);

  useEffect(() => {
    initApp().then(() => {
      renderChild();
    });
  }, []);

  const initApp = async () => {

    await CacheAPI.init();
    dispatch(setCache(CacheAPI.get()));
    await CardanoAPI.init();
    handleConnect = new HandleConnect();

    await SettingsAPI.init();
    await SettingsAPI.commit();

    const theme = SettingsAPI.getTheme() || 'ocean';
    changeTheme(theme);
    const isDarkMode = SettingsAPI.getIsDarkMode();
    setDarkMode(isDarkMode);

    dispatch(setSettings(SettingsAPI.get()));
    const accountsIds: string[] = (await Account.getAllAccountsIds()) || [];
    dispatch(setAccountsIdsInCache(accountsIds));
  };

  const renderChild = () => {
    setChild(props.children);
  };

  return <div id="appWrapper">{child ? child : <p>Loading</p>}</div>;
};

export default AppWrapper;
