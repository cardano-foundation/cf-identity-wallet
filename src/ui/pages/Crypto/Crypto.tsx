import {
  IonButton,
  IonIcon,
  IonModal,
  IonPage,
  useIonViewWillEnter,
} from "@ionic/react";
import Blockies from "react-18-blockies";
import { useEffect, useState } from "react";
import {
  walletOutline,
  arrowUpOutline,
  arrowDownOutline,
  imageOutline,
  layersOutline,
} from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setCurrentRoute,
  getCurrentRoute,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import {
  getCryptoAccountsCache,
  getDefaultCryptoAccountCache,
  getHideCryptoBalances,
  setDefaultCryptoAccountCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { i18n } from "../../../i18n";
import "./Crypto.scss";
import { CryptoAccountProps } from "./Crypto.types";
import { MyWallets } from "../../components/MyWallets";
import { AddCryptoAccount } from "../../components/AddCryptoAccount";
import { ChooseAccountName } from "../../components/ChooseAccountName";
import { CryptoBalance } from "../../components/CryptoBalance";
import { CryptoBalanceItem } from "../../components/CryptoBalance/CryptoBalance.types";
import { formatCurrencyUSD } from "../../../utils";
import { AssetsTransactions } from "../../components/AssetsTransactions";
import {
  defaultCryptoAccountData,
  toastState,
} from "../../constants/dictionary";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { CryptoReceiveAddress } from "../../components/CryptoReceiveAddress";

const Crypto = () => {
  const dispatch = useAppDispatch();
  const currentRoute = useAppSelector(getCurrentRoute);
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );
  const [myWalletsIsOpen, setMyWalletsIsOpen] = useState(false);
  const [addAccountIsOpen, setAddAccountIsOpen] = useState(false);
  const [receiveIsOpen, setReceiveIsOpen] = useState(false);
  const [idwProfileInUse, setIdwProfileInUse] = useState(false);
  const [chooseAccountNameIsOpen, setChooseAccountNameIsOpen] = useState(false);
  const [showAssetsTransactions, setShowAssetsTransactions] = useState(true);
  const [assetsTransactionsExpanded, setAssetsTransactionsExpanded] =
    useState(false);
  const [defaultAccountAddress, setDefaultAccountAddress] = useState(
    useAppSelector(getDefaultCryptoAccountCache)
  );
  const [defaultAccountData, setDefaultAccountData] = useState(
    defaultCryptoAccountData
  );
  const accountAvailable = cryptoAccountsData?.length && defaultAccountData;
  const items: CryptoBalanceItem[] = [
    {
      title: i18n.t("crypto.tab.slider.title.mainbalance"),
      fiatBalance: formatCurrencyUSD(
        defaultAccountData.balance.main.usdBalance
      ),
      nativeBalance:
        defaultAccountData.balance.main.nativeBalance.toFixed(2) + " ADA",
    },
    {
      title: i18n.t("crypto.tab.slider.title.rewardbalance"),
      fiatBalance: formatCurrencyUSD(
        defaultAccountData.balance.reward.usdBalance
      ),
      nativeBalance:
        defaultAccountData.balance.reward.nativeBalance.toFixed(2) + " ADA",
    },
  ];
  const [hideBalance, setHideBalance] = useState(
    useAppSelector(getHideCryptoBalances)
  );

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }));
    setShowAssetsTransactions(true);
  });

  useEffect(() => {
    if (!currentRoute?.path || currentRoute.path !== TabsRoutePath.CRYPTO) {
      setShowAssetsTransactions(false);
    } else {
      setShowAssetsTransactions(true);
    }
  }, [currentRoute]);

  useEffect(() => {
    setIdwProfileInUse(false);
    cryptoAccountsData?.forEach((account) => {
      if (account.address === defaultAccountAddress) {
        setDefaultAccountData(account);
      }
      if (account.usesIdentitySeedPhrase) {
        setIdwProfileInUse(true);
      }
    });
    if (cryptoAccountsData?.length === 1) {
      setDefaultAccountData(cryptoAccountsData[0]);
      dispatch(setDefaultCryptoAccountCache(cryptoAccountsData[0].address));
      PreferencesStorage.set(PreferencesKeys.APP_DEFAULT_CRYPTO_ACCOUNT, {
        data: cryptoAccountsData[0].address,
      });
    }
  }, [cryptoAccountsData, defaultAccountAddress]);

  useEffect(() => {
    if (defaultAccountAddress) {
      setShowAssetsTransactions(true);
    } else {
      setShowAssetsTransactions(false);
    }
  }, [defaultAccountAddress]);

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="my-wallets-button"
        data-testid="my-wallets-button"
        onClick={() => {
          setMyWalletsIsOpen(true);
        }}
      >
        <IonIcon
          slot="icon-only"
          icon={walletOutline}
          color="primary"
        />
      </IonButton>
    );
  };

  const Avatar = () => {
    return (
      <Blockies
        seed={defaultAccountData.name}
        size={7}
        scale={7}
        className="identicon"
      />
    );
  };

  const ActionButtons = () => {
    return (
      <div className="crypto-tab-action-buttons">
        <IonButton
          className="send-button"
          data-testid="send-button"
          color="light-grey"
        >
          <div className="button-inner">
            <IonIcon
              slot="icon-only"
              icon={arrowUpOutline}
              color="primary"
            />
            <span className="button-label-dark">
              {i18n.t("crypto.tab.actionbuttons.send")}
            </span>
          </div>
        </IonButton>
        <IonButton
          className="receive-button"
          data-testid="receive-button"
          color="light-grey"
          onClick={() => setReceiveIsOpen(true)}
        >
          <div className="button-inner">
            <IonIcon
              slot="icon-only"
              icon={arrowDownOutline}
              color="primary"
            />
            <span className="button-label-dark">
              {i18n.t("crypto.tab.actionbuttons.receive")}
            </span>
          </div>
        </IonButton>
        <IonButton
          className="nfts-button"
          data-testid="nfts-button"
          color="secondary"
        >
          <div className="button-inner">
            <IonIcon
              slot="icon-only"
              icon={imageOutline}
              color="light"
            />
            <span className="button-label-light">
              {i18n.t("crypto.tab.actionbuttons.nfts")}
            </span>
          </div>
        </IonButton>
        <IonButton
          className="staking-button"
          data-testid="staking-button"
          color="secondary"
        >
          <div className="button-inner">
            <IonIcon
              slot="icon-only"
              icon={layersOutline}
              color="light"
            />
            <span className="button-label-light">
              {i18n.t("crypto.tab.actionbuttons.staking")}
            </span>
          </div>
        </IonButton>
      </div>
    );
  };

  return (
    <>
      <IonPage
        className={`tab-layout crypto-tab${
          accountAvailable ? " wallet-details" : ""
        }`}
        data-testid="crypto-tab"
      >
        <TabLayout
          header={true}
          avatar={accountAvailable ? <Avatar /> : null}
          title={accountAvailable ? defaultAccountData.name : ""}
          menuButton={true}
          additionalButtons={<AdditionalButtons />}
        >
          {cryptoAccountsData?.length && defaultAccountData ? (
            <>
              <div
                className="crypto-tab-content"
                data-testid="crypto-tab-content"
              >
                <CryptoBalance
                  items={items}
                  hideBalance={hideBalance}
                  setHideBalance={setHideBalance}
                />
                <ActionButtons />
                {showAssetsTransactions && (
                  <IonModal
                    isOpen={true}
                    initialBreakpoint={0.2}
                    breakpoints={[0.2, 1]}
                    canDismiss={false}
                    backdropDismiss={false}
                    backdropBreakpoint={1}
                    onIonBreakpointDidChange={() =>
                      setAssetsTransactionsExpanded(!assetsTransactionsExpanded)
                    }
                    className="crypto-assets-transactions page-layout"
                    data-testid="crypto-assets-transactions"
                  >
                    <AssetsTransactions
                      assets={defaultAccountData.assets}
                      transactions={defaultAccountData.transactions}
                      expanded={assetsTransactionsExpanded}
                      hideBalance={hideBalance}
                    />
                  </IonModal>
                )}
              </div>
              <CryptoReceiveAddress
                isOpen={receiveIsOpen}
                setIsOpen={setReceiveIsOpen}
                accountData={defaultAccountData}
              />
            </>
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("crypto.tab.create")}
              buttonAction={() => setAddAccountIsOpen(true)}
              testId="crypto-cards-placeholder"
            />
          )}
        </TabLayout>
      </IonPage>
      <MyWallets
        myWalletsIsOpen={myWalletsIsOpen}
        setMyWalletsIsOpen={setMyWalletsIsOpen}
        setAddAccountIsOpen={setAddAccountIsOpen}
        defaultAccountData={defaultAccountData}
        setDefaultAccountData={setDefaultAccountData}
        defaultAccountAddress={defaultAccountAddress}
        setDefaultAccountAddress={setDefaultAccountAddress}
      />
      <AddCryptoAccount
        addAccountIsOpen={addAccountIsOpen}
        setAddAccountIsOpen={setAddAccountIsOpen}
        setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
        idwProfileInUse={idwProfileInUse}
      />
      <ChooseAccountName
        chooseAccountNameIsOpen={chooseAccountNameIsOpen}
        setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
        usesIdentitySeedPhrase={true}
        onDone={() => {
          dispatch(setCurrentOperation(toastState.walletCreated));
        }}
      />
    </>
  );
};

export { Crypto };
