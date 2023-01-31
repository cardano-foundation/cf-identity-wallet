import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {CardanoAPI, ERA_PARAMS} from '../lib/CardanoAPI';
import {createAccount} from '../lib/wallet';
import {ERA} from '../models/types';
import {Account} from '../models/Account/Account';
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {selectCount} from "../store/reducers/counter";
import {Cache} from "../models/Cache/Cache";
import {Settings} from "../models/Settings/Settings";
import {getCachedAccount, setCache} from "../store/reducers/cache";
import {setCurrentAccount} from "../store/reducers/account";
import {setSettings} from "../store/reducers/settings";
import {Blockfrost} from "../api/ApiProvider/Blockfrost/BlockfrostApi";

const AppWrapper = (props: { children: any }) => {
  const {t, i18n} = useTranslation();

  const count = useAppSelector(selectCount);
  const cachedAccount = useAppSelector(getCachedAccount);
  const dispatch = useAppDispatch();
  const [incrementAmount] = useState('2');

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
    const init = async () => {
      await initApp();

    };
    if (isMounted.current) {
      // call the function
      init()
          // make sure to catch any error
          .catch(console.error);
    }
  }, []);

  const initApp = async () => {
    await Cache.init();
    dispatch(setCache(Cache.get()));
    await Settings.init();
    dispatch(setSettings(Settings.get()));
    const currentAccount = await Account.getAccount(cachedAccount);
    console.log("currAccount");
    console.log(currentAccount?.get());
    if (currentAccount) {
      dispatch(setCurrentAccount(currentAccount.get()));
    } else {
      const firstAccount = await Account.getFirstAccount();
      if (firstAccount) dispatch(setCurrentAccount(firstAccount.get()));
    }

    console.log("lets init blockfrost");
    await Blockfrost.init('preview');
    const latestParameters = await Blockfrost.epochsLatestParameters();
    console.log("latestParameters");
    console.log(latestParameters);
    const accountState = await Blockfrost.accountState('stake_test1uz4j5w46kceey5kflku62xh9szvk2n3rj88qwct0pcdhxjc4vk9ws');
    console.log("accountState");
    console.log(accountState);
  };

  useEffect(() => {
    const init = async () => {
      await CardanoAPI.init();
      const seed = CardanoAPI.generateSeedPhrase(
          ERA_PARAMS[ERA.SHELLEY].mneSize[24]
      );
      console.log('seed');
      console.log(seed);
      const account: Account = await createAccount(
          'jaime5',
          seed,
          ERA.SHELLEY,
          'B1234567B'
      );

      console.log('account');
      console.log(account);
      console.log(account.toString());

      try {
        account.commit();
      } catch (e) {
        console.log(e);
      }

      // @ts-ignore
      const acc: Account = await Account.getAccount('jaime2');
      console.log('acc');
      console.log(acc);
      //acc.remove();
      // Init Redux
    };
    if (isMounted.current) {
      // call the function
      init()
        // make sure to catch any error
        .catch(console.error);
    }
  }, []);

  return (
    <div
      id="appWrapper"
      data-theme="light">
      {props.children}
    </div>
  );
};

export default AppWrapper;
