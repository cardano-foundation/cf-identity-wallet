import { setupIonicReact  } from '@ionic/react';
import React, { useEffect, useRef } from 'react';
import CardanoModule from "../lib/CardanoModule";
import {useTranslation} from "react-i18next";

// @ts-ignore
const AppWrapper = (props) => {

  const { t, i18n } = useTranslation();

  const useIsMounted = () => {
    const isMounted = useRef(false)
    // @ts-ignore
    useEffect(() => {
      isMounted.current = true
      return () => (isMounted.current = false)
    }, [])
    return isMounted
  }

  const isMounted = useIsMounted();

  useEffect(() => {
    const init = async () => {
      await initApp();
    }
    if (isMounted.current) {
      // call the function
      init()
        // make sure to catch any error
        .catch(console.error)
    }

  }, []);

  const initApp = async () => {

  }

  useEffect(() => {

    const init = async () => {

      await CardanoModule.load();

      const paymentAddress = await CardanoModule.wasmV4.BaseAddress.from_address(CardanoModule.wasmV4.Address.from_bech32('addr1qy0gd5rg9v3mhf8usam98j3tk7rqgdqs0zqammwcp5nscxpm7mazwuz867mpxu2m4u4ec4gqshycdkqyc2lextajzunq2nqwdv'));
      console.log('paymentAddress');
      console.log(paymentAddress);

    }
    if (isMounted.current) {
      // call the function
      init()
          // make sure to catch any error
          .catch(console.error)
    }
  }, [])


  return (
    <>
      {props.children}
    </>
  );
};

export default AppWrapper;
