import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonModal,
  IonPage,
  IonRow,
  useIonViewWillEnter,
} from "@ionic/react";
import crypto from "crypto";
import { useEffect, useState } from "react";
import {
  walletOutline,
  addOutline,
  repeatOutline,
  addCircleOutline,
  refreshOutline,
} from "ionicons/icons";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import { CardsPlaceholder } from "../../components/CardsPlaceholder";
import {
  getCryptoAccountsCache,
  setCryptoAccountsCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { i18n } from "../../../i18n";
import "./Crypto.scss";
import { PageLayout } from "../../components/layout/PageLayout";
import { CryptoAccountProps } from "./Crypto.types";
import { VerifyPassword } from "../../components/VerifyPassword";
import { CustomInput } from "../../components/CustomInput";

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
  const [accountName, setAccountName] = useState(
    `${i18n.t("crypto.chooseaccountnamemodal.placeholder")}`
  );

  useEffect(() => {
    cryptoAccountsData.forEach((account) => {
      if (account.usesIdentitySeedPhrase) {
        setIdwProfileInUse(true);
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

  const MyWallets = () => {
    return (
      <IonModal
        isOpen={myWalletsIsOpen}
        initialBreakpoint={1}
        breakpoints={[0, 1]}
        className="page-layout"
        data-testid="my-wallets"
        onDidDismiss={() => setMyWalletsIsOpen(false)}
      >
        <div className="my-wallets modal">
          <PageLayout
            header={true}
            closeButton={false}
            title={`${i18n.t("crypto.mywalletsmodal.title")}`}
          >
            <IonGrid>
              <IonRow>
                <IonCol
                  size="12"
                  className="my-wallets-body"
                >
                  <i>{i18n.t("crypto.mywalletsmodal.empty")}</i>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonGrid>
              <IonRow>
                <IonCol
                  size="12"
                  className="my-wallets-footer"
                >
                  <IonButton
                    shape="round"
                    expand="block"
                    className="ion-primary-button"
                    onClick={() => {
                      setMyWalletsIsOpen(false);
                      setAddAccountIsOpen(true);
                    }}
                  >
                    <IonIcon
                      slot="icon-only"
                      size="small"
                      icon={addOutline}
                      color="primary"
                    />
                    {i18n.t("crypto.mywalletsmodal.create")}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </PageLayout>
        </div>
      </IonModal>
    );
  };

  const AddCryptoAccount = () => {
    return (
      <IonModal
        isOpen={addAccountIsOpen}
        initialBreakpoint={0.3}
        breakpoints={[0, 0.3]}
        className="page-layout"
        data-testid="add-crypto-account"
        onDidDismiss={() => setAddAccountIsOpen(false)}
      >
        <div className="add-crypto-account modal">
          <PageLayout
            header={true}
            closeButton={false}
            title={`${i18n.t("crypto.addcryptoaccountmodal.title")}`}
          >
            <IonGrid>
              <IonRow>
                <IonCol
                  size="12"
                  className="add-crypto-account-body"
                >
                  {!idwProfileInUse && (
                    <span
                      className="add-crypto-account-option"
                      data-testid="add-crypto-account-reuse-button"
                      onClick={() => {
                        setAddAccountIsOpen(false);
                        setShowVerifyPassword(true);
                      }}
                    >
                      <span>
                        <IonButton shape="round">
                          <IonIcon
                            slot="icon-only"
                            icon={repeatOutline}
                          />
                        </IonButton>
                      </span>
                      <span className="add-crypto-account-label">
                        {i18n.t("crypto.addcryptoaccountmodal.reuse")}
                      </span>
                    </span>
                  )}
                  <span
                    className="add-crypto-account-option"
                    data-testid="add-crypto-account-generate-button"
                    onClick={() => {
                      return;
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={addCircleOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="add-crypto-account-label">
                      {i18n.t("crypto.addcryptoaccountmodal.generate")}
                    </span>
                  </span>
                  <span
                    className="add-crypto-account-option"
                    data-testid="add-crypto-account-restore-button"
                    onClick={() => {
                      return;
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={refreshOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="add-crypto-account-label">
                      {i18n.t("crypto.addcryptoaccountmodal.restore")}
                    </span>
                  </span>
                </IonCol>
              </IonRow>
            </IonGrid>
          </PageLayout>
        </div>
      </IonModal>
    );
  };

  const ChooseAccountName = () => {
    return (
      <IonModal
        isOpen={chooseAccountNameIsOpen}
        initialBreakpoint={0.3}
        breakpoints={[0, 0.3]}
        className="page-layout"
        data-testid="choose-account-name"
        onDidDismiss={() => setChooseAccountNameIsOpen(false)}
      >
        <div className="choose-account-name modal">
          <PageLayout
            header={true}
            closeButton={false}
            title={`${i18n.t("crypto.chooseaccountnamemodal.title")}`}
            actionButton={true}
            actionButtonLabel={`${i18n.t(
              "crypto.chooseaccountnamemodal.skip"
            )}`}
            actionButtonAction={handleSkip}
          >
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <CustomInput
                    dataTestId="edit-display-name"
                    title={`${i18n.t("crypto.chooseaccountnamemodal.label")}`}
                    hiddenInput={false}
                    autofocus={true}
                    placeholder={`${i18n.t(
                      "crypto.chooseaccountnamemodal.placeholder"
                    )}`}
                    onChangeInput={setAccountName}
                    value={accountName}
                  />
                </IonCol>
              </IonRow>
              <IonButton
                shape="round"
                expand="block"
                className="ion-primary-button"
                data-testid="continue-button"
                onClick={handleCreateWallet}
                disabled={
                  accountName ===
                  `${i18n.t("crypto.chooseaccountnamemodal.placeholder")}`
                }
              >
                {i18n.t("crypto.chooseaccountnamemodal.confirm")}
              </IonButton>
            </IonGrid>
          </PageLayout>
        </div>
      </IonModal>
    );
  };

  const handleCreateWallet = () => {
    const newWallet: CryptoAccountProps = {
      name: `${accountName}`,
      currency: "ADA", // @TODO - sdisalvo: remove whenever core is ready
      balance: 2785.82, // @TODO - sdisalvo: remove whenever core is ready
      usesIdentitySeedPhrase: true,
    };
    dispatch(setCryptoAccountsCache([...cryptoAccountsData, newWallet]));
    setChooseAccountNameIsOpen(false);
  };

  const handleSkip = () => {
    const newWallet = {
      name:
        i18n.t("crypto.chooseaccountnamemodal.placeholder") +
        " " +
        crypto.randomBytes(3).toString("hex"),
      currency: "ADA", // @TODO - sdisalvo: remove whenever core is ready
      balance: 2785.82, // @TODO - sdisalvo: remove whenever core is ready
      usesIdentitySeedPhrase: true,
    };
    dispatch(setCryptoAccountsCache([...cryptoAccountsData, newWallet]));
    setChooseAccountNameIsOpen(false);
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
          {cryptoAccountsData.length ? (
            <pre>{JSON.stringify(cryptoAccountsData[0], null, 2)}</pre>
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("crypto.tab.create")}
              buttonAction={() => setAddAccountIsOpen(true)}
            />
          )}
        </TabLayout>
      </IonPage>
      {myWalletsIsOpen && <MyWallets />}
      {addAccountIsOpen && <AddCryptoAccount />}
      {showVerifyPassword && (
        <VerifyPassword
          isOpen={showVerifyPassword}
          onVerify={() => {
            setShowVerifyPassword(false);
            setChooseAccountNameIsOpen(true);
          }}
          setIsOpen={(isOpen: boolean) => setShowVerifyPassword(isOpen)}
        />
      )}
      {chooseAccountNameIsOpen && <ChooseAccountName />}
    </>
  );
};

export { Crypto };
