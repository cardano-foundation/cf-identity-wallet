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
  setDefaultCryptoAccountCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { formatCurrencyUSD } from "../../../utils";
import { VerifyPassword } from "../VerifyPassword";
import { RenameWallet } from "../RenameWallet";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { VerifyPasscode } from "../../pages/VerifyPasscode";
import { getStateCache } from "../../../store/reducers/stateCache";

const MyWallets = ({
  myWalletsIsOpen,
  setMyWalletsIsOpen,
  setAddAccountIsOpen,
  defaultAccountData,
  setDefaultAccountData,
  defaultAccountAddress,
  setDefaultAccountAddress,
}: MyWalletsProps) => {
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );
  const [selectedAccount, setSelectedAccount] = useState({
    name: "",
    address: "",
  });
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  const handleSetDefaultAccount = (address: string) => {
    dispatch(setDefaultCryptoAccountCache(address));
    PreferencesStorage.set(PreferencesKeys.APP_DEFAULT_CRYPTO_ACCOUNT, {
      data: address,
    });
    cryptoAccountsData.forEach((account) => {
      if (account.address === address) {
        setDefaultAccountData(account);
        setDefaultAccountAddress(address);
      }
    });
    setMyWalletsIsOpen(false);
  };

  const handleDelete = () => {
    const updatedAccountsData = cryptoAccountsData.filter(
      (account) => account.address !== selectedAccount.address
    );

    if (selectedAccount.address === defaultAccountAddress) {
      if (updatedAccountsData.length > 0) {
        setDefaultAccountAddress(updatedAccountsData[0].address);
        dispatch(setDefaultCryptoAccountCache(updatedAccountsData[0].address));
        PreferencesStorage.set(PreferencesKeys.APP_DEFAULT_CRYPTO_ACCOUNT, {
          data: updatedAccountsData[0].address,
        });
      } else {
        setDefaultAccountAddress("");
        dispatch(setDefaultCryptoAccountCache(""));
        PreferencesStorage.remove(PreferencesKeys.APP_DEFAULT_CRYPTO_ACCOUNT);
      }
    }
    dispatch(setCryptoAccountsCache(updatedAccountsData));
    // @TODO - sdisalvo: Remember to update Database.
  };

  const Checkmark = () => {
    return (
      <div
        className="selected-account-checkmark"
        data-testid="selected-account-checkmark"
      >
        <div className="selected-account-checkmark-inner">
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
    index: number;
    account: CryptoAccountProps;
  }

  const AccountItem = ({ account, index }: AccountItemProps) => {
    return (
      <IonItemSliding
        onClick={() => handleSetDefaultAccount(account.address)}
        data-testid={`my-wallets-account-${index}`}
      >
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
                {account.address === defaultAccountData.address && (
                  <Checkmark />
                )}
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
                <IonLabel>
                  {formatCurrencyUSD(account.balance.main.usdBalance)}
                </IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonItem>
        <IonItemOptions
          side="end"
          onIonSwipe={() => {
            setSelectedAccount({
              name: account.name,
              address: account.address,
            });
            if (stateCache?.authentication.passwordIsSet) {
              setVerifyPasswordIsOpen(true);
            } else {
              setVerifyPasscodeIsOpen(true);
            }
          }}
        >
          <IonItemOption
            color="dark-grey"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedAccount({
                name: account.name,
                address: account.address,
              });
              setEditIsOpen(true);
            }}
          >
            Rename
          </IonItemOption>
          <IonItemOption
            color="danger"
            expandable
            className="delete-button"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedAccount({
                name: account.name,
                address: account.address,
              });

              if (
                !stateCache?.authentication.passwordIsSkipped &&
                stateCache?.authentication.passwordIsSet
              ) {
                setVerifyPasswordIsOpen(true);
              } else {
                setVerifyPasscodeIsOpen(true);
              }
            }}
          >
            Delete
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    );
  };

  return (
    <>
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
                            index={index}
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
      <RenameWallet
        isOpen={editIsOpen}
        setIsOpen={setEditIsOpen}
        address={selectedAccount.address}
        name={selectedAccount.name}
      />
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={handleDelete}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={handleDelete}
      />
    </>
  );
};

export { MyWallets };
