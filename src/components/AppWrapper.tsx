import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import find from "pouchdb-find";
PouchDB.plugin(find)
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));

import {CardanoAPI} from '../lib/CardanoAPI';
import {Account} from '../models/Account/Account';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {CacheAPI} from '../models/Cache/CacheAPI';
import {SettingsAPI} from '../models/Settings/Settings';
import {
  getCachedAccount,
  setAccountsIdsInCache,
  setCache,
} from '../store/reducers/cache';
import {setSettings} from '../store/reducers/settings';
import {changeTheme} from '../theme/handleTheme';
import {PouchAPI} from "../db/database";
import { PreferencesAPI } from '../db/preferences';
import {HandleConnect} from "../api/p2p/HandleConnect";

export let handleConnect:HandleConnect | undefined = undefined;

const AppWrapper = (props: {children: any}) => {

  const cachedAccount = useAppSelector(getCachedAccount);
  const dispatch = useAppDispatch();

  const {t, i18n} = useTranslation();
  const [child, setChild] = useState(null);

  useEffect(() => {
    initApp().then(() => {
      renderChild();
    });

  }, []);

  const initApp = async () => {
    console.log("Init App")

    await PouchAPI.init();
    //await PouchAPI.clear();
    await PreferencesAPI.init();
    await CacheAPI.init();
    await CardanoAPI.init();

    handleConnect = new HandleConnect();
    dispatch(setCache(CacheAPI.get()));
    await SettingsAPI.init();
    if (SettingsAPI.theme?.length) {
      // Use matchMedia to check the OS native preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (
          (prefersDark.matches && SettingsAPI.theme !== 'dark') ||
          (!prefersDark.matches && SettingsAPI.theme !== 'light')
      ) {
        changeTheme();
      }
    }

    dispatch(setSettings(SettingsAPI.get()));

    const accountsIds: string[] = (await Account.getAllAccountsIds()) || [];
    dispatch(setAccountsIdsInCache(accountsIds));
    
    /*
    const accountsIds: string[] = (await Account.getAllAccountsIds()) || [];
    dispatch(setAccountsIdsInCache(accountsIds));

    const currentAccount = await Account.getAccount(cachedAccount);
    if (currentAccount) {
      dispatch(setCurrentAccount(currentAccount.get()));
    } else {
      const firstAccount = await Account.getFirstAccount();
      if (firstAccount) dispatch(setCurrentAccount(firstAccount.get()));
    }

    */
    /* Debug - Do not delete
    console.log("lets init blockfrost");
    await Blockfrost.init('preview');
    const latestParameters = await Blockfrost.epochsLatestParameters();
    console.log("latestParameters");
    console.log(latestParameters);
    const accountState = await Blockfrost.accountState('stake_test1uz4j5w46kceey5kflku62xh9szvk2n3rj88qwct0pcdhxjc4vk9ws');
    console.log("accountState");
    console.log(accountState);
    */

    /*
      if (await Account.accountAlreadyExists("alice")){
        console.log("account already exists");
      } else {
        console.log("set new account");
        await PouchAPI.set("account","alice",{name: "alice"})
      }
      const ids = await PouchAPI.getIDs("account");
      console.log("ids");
      console.log(ids);

      const user = await PouchAPI.getByField("account","name", "bob");
      console.log("user");
      console.log(user);
      const user3 = await PouchAPI.get("account","bob");
      console.log("user3");
      console.log(user3);

      console.log("PouchAPI");
      console.log(PouchAPI.db);
      console.log("All Accounts");
      console.log(await Account.getAllAccounts());
      */
  };

  const renderChild = () => {
    setChild(props.children)
  }

  return (
      <div
          id="appWrapper">
        { child ? child : <p>Loading</p>}
      </div>
  );
};

export default AppWrapper;
