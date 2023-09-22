import { useEffect, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { i18n } from "../../../i18n";
import "./RenameWallet.scss";
import { CustomInput } from "../CustomInput";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { RenameWalletProps } from "./RenameWallet.types";
import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";
import {
  getCryptoAccountsCache,
  setCryptoAccountsCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { setCurrentOperation } from "../../../store/reducers/stateCache";
import { toastState } from "../../constants/dictionary";

const RenameWallet = ({
  isOpen,
  setIsOpen,
  address,
  name,
}: RenameWalletProps) => {
  const [newWalletName, setNewWalletName] = useState(name);
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);
  const verifyDisplayName = newWalletName.length > 0 && newWalletName !== name;
  const dispatch = useAppDispatch();
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );

  useEffect(() => {
    setNewWalletName(name);
  }, [name]);

  const handleClose = () => {
    setIsOpen(false);
    setNewWalletName(name);
    dispatch(setCurrentOperation(""));
  };

  const handleSubmit = () => {
    handleRename();
    setIsOpen(false);
    dispatch(setCurrentOperation(toastState.walletRenamed));
  };

  const handleRename = () => {
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

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener("keyboardWillShow", () => {
        setkeyboardIsOpen(true);
      });
      Keyboard.addListener("keyboardWillHide", () => {
        setkeyboardIsOpen(false);
      });
    }
  }, []);

  return (
    <>
      <IonModal
        isOpen={isOpen}
        initialBreakpoint={0.35}
        breakpoints={[0, 0.35]}
        className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
        data-testid="rename-wallet-modal"
        onDidDismiss={handleClose}
      >
        <div className="rename-wallet modal editor">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonButtons slot="start">
                <IonButton
                  className="close-button-label"
                  onClick={handleClose}
                  data-testid="close-button"
                >
                  {i18n.t("crypto.renamewallet.cancel")}
                </IonButton>
              </IonButtons>
              <IonTitle data-testid="rename-wallet-title">
                <h2>{i18n.t("crypto.renamewallet.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent color="light">
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <CustomInput
                    dataTestId="rename-wallet-name"
                    title={`${i18n.t("crypto.renamewallet.label")}`}
                    hiddenInput={false}
                    autofocus={true}
                    placeholder={`${i18n.t("crypto.renamewallet.placeholder")}`}
                    onChangeInput={setNewWalletName}
                    value={newWalletName}
                  />
                </IonCol>
              </IonRow>
              <IonButton
                shape="round"
                expand="block"
                className="ion-primary-button"
                data-testid="continue-button"
                onClick={handleSubmit}
                disabled={!verifyDisplayName}
              >
                {i18n.t("crypto.renamewallet.confirm")}
              </IonButton>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
    </>
  );
};

export { RenameWallet };
