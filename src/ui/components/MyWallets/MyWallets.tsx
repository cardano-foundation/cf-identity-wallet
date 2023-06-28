import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { MyWalletsProps } from "./MyWallets.types";
import "./MyWallets.scss";
import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";
import { useAppSelector } from "../../../store/hooks";
import { getCryptoAccountsCache } from "../../../store/reducers/cryptoAccountsCache";
import { cryptoAccountsMock } from "../../__mocks__/cryptoAccountsMock";
import { formatCurrencyUSD } from "../../../utils";

const MyWallets = ({
  myWalletsIsOpen,
  setMyWalletsIsOpen,
  setAddAccountIsOpen,
}: MyWalletsProps) => {
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );
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
                {cryptoAccountsData?.length ? (
                  <IonList
                    lines="none"
                    className="accounts-list"
                  >
                    <IonGrid>
                      {cryptoAccountsData.map(
                        (account: CryptoAccountProps, index: number) => (
                          <IonRow key={index}>
                            <IonCol
                              size="1.5"
                              className="account-logo"
                            >
                              <img
                                src={account.logo}
                                alt="blockchain-logo"
                              />
                            </IonCol>
                            <IonCol
                              size="6"
                              className="account-info"
                            >
                              <IonLabel className="account-name">
                                {account.name}
                              </IonLabel>
                              <IonLabel className="account-blockchain">
                                {account.blockchain}
                              </IonLabel>
                            </IonCol>
                            <IonCol
                              size="3.5"
                              className="account-balance"
                            >
                              <IonLabel>
                                {formatCurrencyUSD.format(account.usdBalance)}
                              </IonLabel>
                            </IonCol>
                          </IonRow>
                        )
                      )}
                    </IonGrid>
                  </IonList>
                ) : (
                  <i>{i18n.t("crypto.mywalletsmodal.empty")}</i>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
        <div className="my-wallets-footer">
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
        </div>
      </div>
    </IonModal>
  );
};

export { MyWallets };
