import {setupIonicReact} from '@ionic/react';
import React, {useEffect, useRef} from 'react';
import CardanoModule from '../lib/CardanoModule';
import {useTranslation} from 'react-i18next';
import {CardanoApi, ERA_PARAMS} from '../lib/ CardanoAPI';
import {createAccount} from '../lib/wallet';
import {ERA} from '../models/types';
import {Account} from '../models/Account/Account';

const AppWrapper = (props: {children: any}) => {
  const {t, i18n} = useTranslation();

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

  const initApp = async () => {};

  useEffect(() => {
    const init = async () => {
      await CardanoApi.init();
      const seed = CardanoApi.generateSeedPhrase(
        ERA_PARAMS[ERA.SHELLEY].mneSize[24]
      );
      console.log('seed');
      console.log(seed);
      const account: Account = await createAccount(
        'jaime2',
        seed,
        ERA.SHELLEY,
        'B1234567B'
      );

      console.log('account');
      console.log(account);

      account.commit();

      // @ts-ignore
      const acc: Account = await Account.getAccount('jaime2');
      console.log('acc');
      console.log(acc);
      acc.remove();
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
