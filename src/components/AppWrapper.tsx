import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {CardanoAPI, ERA_PARAMS} from '../lib/CardanoAPI';
import {createAccount} from '../lib/wallet';
import {ERA} from '../models/types';
import {Account} from '../models/Account/Account';
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {increment, selectCount} from "../redux/reducers/counter";

const AppWrapper = (props: { children: any }) => {
  const {t, i18n} = useTranslation();

  const count = useAppSelector(selectCount);
  const dispatch = useAppDispatch();
  const [incrementAmount] = useState('2');

  console.log("count");
  console.log(count);

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

      dispatch(increment());
    };
    if (isMounted.current) {
      // call the function
      init()
        // make sure to catch any error
        .catch(console.error);
    }
  }, []);

  const initApp = async () => {};

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
      console.log(account.toJson());

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
