import React, { FC, Fragment, useEffect, useRef, useState } from 'react';

// @ts-ignore
import {
  setBlockfrostNetwork,
  setBlockfrostToken,
  setBlockfrostUrl,
  setLanguage,
  setSettings,
  setSubmitUrl,
} from '../../store/actions';
import { useTranslation } from 'react-i18next';
import { Browser } from '@capacitor/browser';
import { addOriginToWhitelist } from '../../db';
interface IEnable {
  request: {
    id: string;
    method: string;
    target: string;
    sender: string;
    origin: string;
  } | null;
  controller: any;
}
const Enable: FC<IEnable> = (props: IEnable) => {
  const { t, i18n } = useTranslation();

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
    const init = async () => {};
    if (isMounted.current) {
      // call the function
      init()
        // make sure to catch any error
        .catch(console.error);
    }
  }, []);

  const openCapacitorSite = async (site: string) => {
    await Browser.open({ url: site });
  };

  const handleConnect = async () => {
    if (props.request?.origin) {
      await addOriginToWhitelist(props.request?.origin);
      await props.controller.returnData({ data: true });
      window.close();
    }
  };

  const handleCancel = async () => {
    await props.controller.returnData({ error: 'Canceled' });
    window.close();
  };

  console.log('props');
  console.log(props);
  const RenderEnable = () => {
    return (
      <>
        <div className="flex h-screen">
          <div className="m-auto w-full">
            <div className="">
              <section className="text-gray-600 body-font relative">
                <div className="px-5 py-24 mx-auto">
                  <div className="flex flex-col text-center w-full mb-12">
                    <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
                      <span>
                        <svg
                          className="inline-block mb-4"
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m13 2-2 2.5h3L12 7"></path>
                          <path d="M12 22v-3"></path>
                          <path d="M10 13v-2.5"></path>
                          <path d="M10 12.5v-2"></path>
                          <path d="M14 12.5v-2"></path>
                          <path d="M16 15a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2z"></path>
                        </svg>
                      </span>
                      Connect with Website
                    </h1>
                    <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-xl">
                      {(props.request && props.request.origin) || 'No Origin'}
                    </p>
                  </div>
                  <div className="lg:w-1/2 md:w-2/3 mx-auto">
                    <div className="flex flex-wrap -m-2">
                      <div className="p-2 w-full">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleCancel()}
                            type="button"
                            className="
                              w-full
                              inline-flex
                              justify-center max-w-sm mr-2 cursor-pointer rounded-md border border-transparent bg-orange-100 mt-2 mb-8 px-6 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConnect()}
                            type="button"
                            className="
                            w-full
                            inline-flex
                            justify-center uppercase cursor-pointer rounded-md border border-transparent bg-blue-100 mt-2 mb-8 px-6 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                      <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
                        <a className="text-blue-500">
                          Your are using{' '}
                          <span
                            className="cursor-pointer underline"
                            onClick={() =>
                              openCapacitorSite(
                                'https://github.com/cardano-foundation/cf-identity-wallet'
                              )
                            }
                          >
                            ID Wallet
                          </span>
                        </a>
                        <p className="leading-normal my-5">
                          {' '}
                          With ❤️
                          <br /> Cardano Foundation
                        </p>
                        <span className="inline-flex">
                          <a
                            onClick={() =>
                              openCapacitorSite(
                                'https://twitter.com/Cardano_CF'
                              )
                            }
                            className="text-gray-500 cursor-pointer"
                          >
                            <svg
                              fill="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                            </svg>
                          </a>
                          <a
                            onClick={() =>
                              openCapacitorSite(
                                'https://github.com/cardano-foundation/cf-identity-wallet'
                              )
                            }
                            className="ml-4 text-gray-500 cursor-pointer"
                          >
                            <svg
                              fill="currentColor"
                              aria-hidden="true"
                              focusable="false"
                              data-prefix="fab"
                              data-icon="github"
                              className="w-4"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 496 512"
                            >
                              <path
                                fill="currentColor"
                                d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                              ></path>
                            </svg>
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </>
    );
  };

  return <RenderEnable />;
};

export default Enable;
