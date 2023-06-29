import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
} from "@ionic/react";
import { addOutline, checkmark } from "ionicons/icons";
import { useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { MyWalletsProps } from "./MyWallets.types";
import "./MyWallets.scss";
import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCryptoAccountsCache,
  setCryptoAccountsCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { formatCurrencyUSD } from "../../../utils";

const MyWallets = ({
  myWalletsIsOpen,
  setMyWalletsIsOpen,
  setAddAccountIsOpen,
}: MyWalletsProps) => {
  const dispatch = useAppDispatch();
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );

  const handleSelect = (address: string) => {
    // @TODO - sdisalvo: Update Database.
    const updatedAccountsData: CryptoAccountProps[] = [];
    cryptoAccountsData.forEach((account) => {
      const obj = { ...account };
      if (account.address === address) {
        obj.isSelected = true;
      } else {
        obj.isSelected = false;
      }
      updatedAccountsData.push(obj);
    });
    dispatch(setCryptoAccountsCache(updatedAccountsData));
    setMyWalletsIsOpen(false);
  };

  const handleRename = (address: string, newWalletName: string) => {
    // @TODO - sdisalvo: Update Database.
    const updatedAccountsData: CryptoAccountProps[] = [];
    cryptoAccountsData.forEach((account) => {
      const obj = { ...account };
      if (account.address === address) {
        obj.name = newWalletName;
      }
      updatedAccountsData.push(obj);
    });
    dispatch(setCryptoAccountsCache(updatedAccountsData));
  };

  const handleDelete = (address: string) => {
    // @TODO - sdisalvo: Update Database.
    const updatedAccountsData = cryptoAccountsData.filter(
      (account) => account.address !== address
    );
    dispatch(setCryptoAccountsCache(updatedAccountsData));
  };

  const Checkmark = () => {
    return (
      <div className="checkmark-base">
        <div className="checkmark-inner">
          <IonIcon
            slot="icon-only"
            icon={checkmark}
          />
        </div>
      </div>
    );
  };

  interface AccountItemProps {
    key: number;
    account: CryptoAccountProps;
  }

  const AccountItem = ({ account }: AccountItemProps) => {
    return (
      <IonItemSliding onClick={() => handleSelect(account.address)}>
        <IonItem>
          <IonGrid>
            <IonRow>
              <IonCol
                size="1.5"
                className="account-logo"
              >
                <img
                  src={account.logo}
                  alt="blockchain-logo"
                />
                {account.isSelected && <Checkmark />}
              </IonCol>
              <IonCol
                size="5.5"
                className="account-info"
              >
                <IonLabel className="account-name">{account.name}</IonLabel>
                <IonLabel className="account-blockchain">
                  {account.blockchain}
                </IonLabel>
              </IonCol>
              <IonCol
                size="4"
                className="account-balance"
              >
                <IonLabel>{formatCurrencyUSD(account.usdBalance)}</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonItem>
        <IonItemOptions side="end">
          <IonItemOption color="dark-grey">Rename</IonItemOption>
          <IonItemOption
            color="danger"
            expandable
          >
            Delete
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

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
                    {cryptoAccountsData.map((account, index) => {
                      return (
                        <AccountItem
                          key={index}
                          account={account}
                        />
                      );
                    })}
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
