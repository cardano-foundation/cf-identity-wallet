import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
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
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import {
  getCryptoAccountsCache,
  getDefaultCryptoAccountCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { i18n } from "../../../i18n";
import "./Crypto.scss";
import { CryptoAccountProps } from "./Crypto.types";
import { VerifyPassword } from "../../components/VerifyPassword";
import { MyWallets } from "../../components/MyWallets";
import { AddCryptoAccount } from "../../components/AddCryptoAccount";
import { ChooseAccountName } from "../../components/ChooseAccountName";
import { CryptoBalance } from "../../components/CryptoBalance";
import { CryptoBalanceItem } from "../../components/CryptoBalance/CryptoBalance.types";
import { formatCurrencyUSD } from "../../../utils";

const Crypto = () => {
  const dispatch = useAppDispatch();
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );
  const [myWalletsIsOpen, setMyWalletsIsOpen] = useState(false);
  const [addAccountIsOpen, setAddAccountIsOpen] = useState(false);
  const [idwProfileInUse, setIdwProfileInUse] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [chooseAccountNameIsOpen, setChooseAccountNameIsOpen] = useState(false);
  const [defaultAccountAddress, setDefaultAccountAddress] = useState(
    useAppSelector(getDefaultCryptoAccountCache)
  );
  const [defaultAccountData, setDefaultAccountData] =
    useState<CryptoAccountProps>({
      address: "",
      name: "",
      blockchain: "",
      currency: "",
      logo: "",
      nativeBalance: 0,
      usdBalance: 0,
      usesIdentitySeedPhrase: false,
    });
  const items: CryptoBalanceItem[] = [
    {
      title: i18n.t("crypto.tab.slider.title.mainbalance"),
      fiatBalance: formatCurrencyUSD(defaultAccountData.usdBalance),
      nativeBalance: defaultAccountData.nativeBalance.toFixed(2) + " ADA",
    },
  ];

  useEffect(() => {
    cryptoAccountsData?.forEach((account) => {
      if (account.address === defaultAccountAddress) {
        setDefaultAccountData(account);
      }
      if (account.usesIdentitySeedPhrase) {
        setIdwProfileInUse(true);
      } else {
        setIdwProfileInUse(false);
      }
    });
    if (!cryptoAccountsData?.length) {
      setIdwProfileInUse(false);
    }
  }, [cryptoAccountsData, defaultAccountAddress]);

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }))
  );

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
          defaultAccountData ? " wallet-details" : ""
        }`}
        data-testid="crypto-tab"
      >
        <TabLayout
          header={true}
          avatar={defaultAccountData && <Avatar />}
          title={defaultAccountData ? defaultAccountData.name : ""}
          menuButton={true}
          additionalButtons={<AdditionalButtons />}
        >
          {cryptoAccountsData?.length && defaultAccountData ? (
            <div
              className="crypto-tab-content"
              data-testid="crypto-tab-content"
            >
              <CryptoBalance items={items} />
              <ActionButtons />
            </div>
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("crypto.tab.create")}
              buttonAction={() => setAddAccountIsOpen(true)}
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
        setShowVerifyPassword={setShowVerifyPassword}
        idwProfileInUse={idwProfileInUse}
      />
      <VerifyPassword
        isOpen={showVerifyPassword}
        onVerify={() => {
          setShowVerifyPassword(false);
          setChooseAccountNameIsOpen(true);
        }}
        setIsOpen={(isOpen: boolean) => setShowVerifyPassword(isOpen)}
      />
      <ChooseAccountName
        chooseAccountNameIsOpen={chooseAccountNameIsOpen}
        setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
        setDefaultAccountData={setDefaultAccountData}
      />
    </>
  );
};

export { Crypto };
