import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import Blockies from "react-18-blockies";
import { useEffect, useState } from "react";
import { walletOutline } from "ionicons/icons";
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
      title: i18n.t("crypto.slider.title.mainbalance"),
      fiatBalance: formatCurrencyUSD(defaultAccountData.usdBalance),
      nativeBalance: defaultAccountData.nativeBalance.toFixed(2) + " ADA",
    },
    {
      title: i18n.t("crypto.slider.title.mainbalance"),
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
            <CryptoBalance items={items} />
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
