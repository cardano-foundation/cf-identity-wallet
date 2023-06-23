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
import { useState } from "react";
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
import { getCryptoAccountsCache } from "../../../store/reducers/cryptoAccountsCache";
import { i18n } from "../../../i18n";
import "./Crypto.scss";
import { PageLayout } from "../../components/layout/PageLayout";

const Crypto = () => {
  const dispatch = useAppDispatch();
  const cryptoAccountsData = []; // useAppSelector(getCryptoAccountsCache);
  const [myWalletsIsOpen, setMyWalletsIsOpen] = useState(false);
  const [addAccountIsOpen, setAddAccountIsOpen] = useState(false);

  const handleAddCryptoAccount = () => {
    //
  };

  useIonViewWillEnter(() =>
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }))
  );

  const AdditionalButtons = () => {
    return (
      <IonButton
        shape="round"
        className="share-button"
        data-testid="share-button"
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
        breakpoints={[1]}
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
        breakpoints={[0.3]}
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
                  <span
                    className="add-crypto-account-option"
                    data-testid="add-crypto-account-reuse-button"
                    onClick={() => {
                      return;
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
            <div>Account details here</div>
          ) : (
            <CardsPlaceholder
              buttonLabel={i18n.t("crypto.tab.create")}
              buttonAction={() => setAddAccountIsOpen(true)}
            />
          )}
        </TabLayout>
      </IonPage>
      <MyWallets />
      <AddCryptoAccount />
    </>
  );
};

export { Crypto };
