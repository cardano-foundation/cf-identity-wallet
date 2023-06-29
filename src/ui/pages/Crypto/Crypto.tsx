import { IonButton, IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import { useEffect, useState } from "react";
import { walletOutline } from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import { getCryptoAccountsCache } from "../../../store/reducers/cryptoAccountsCache";
import { i18n } from "../../../i18n";
import "./Crypto.scss";
import { CryptoAccountProps } from "./Crypto.types";
import { VerifyPassword } from "../../components/VerifyPassword";
import { MyWallets } from "../../components/MyWallets";
import { AddCryptoAccount } from "../../components/AddCryptoAccount";
import { ChooseAccountName } from "../../components/ChooseAccountName";
import { PreferencesStorage } from "../../../core/storage/preferences/preferencesStorage";

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
  const [defaultCryptoAccount, setDefaultCryptoAccount] = useState("");
  const [currentAccount, setCurrentAccount] = useState<CryptoAccountProps>({
    address: "",
    name: "",
    blockchain: "",
    currency: "",
    logo: "",
    nativeBalance: 0,
    usdBalance: 0,
    usesIdentitySeedPhrase: false,
  });

  useEffect(() => {
    cryptoAccountsData?.forEach((account) => {
      if (account.usesIdentitySeedPhrase) {
        setIdwProfileInUse(true);
      } else {
        setIdwProfileInUse(false);
      }
    });

    if (cryptoAccountsData.length === 1 && !defaultCryptoAccount) {
      PreferencesStorage.set("defaultCryptoAccount", {
        data: cryptoAccountsData[0].address,
      });
    } else if (cryptoAccountsData.length === 0 && defaultCryptoAccount) {
      PreferencesStorage.remove("defaultCryptoAccount");
    }

    cryptoAccountsData.forEach((account) => {
      if (account.address === `${defaultCryptoAccount}`) {
        setCurrentAccount(account);
      }
    });
  }, [cryptoAccountsData]);

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

  return (
    <>
      <IonPage
        className="tab-layout"
        data-testid="crypto-tab"
      >
        <TabLayout
          header={true}
          title=""
          menuButton={true}
          additionalButtons={<AdditionalButtons />}
        >
          {cryptoAccountsData?.length ? (
            <pre>{JSON.stringify(currentAccount, null, 2)}</pre>
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
        currentAccount={currentAccount}
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
      />
    </>
  );
};

export { Crypto };
