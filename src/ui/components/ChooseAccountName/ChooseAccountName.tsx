import { IonModal, IonGrid, IonRow, IonCol, IonButton } from "@ionic/react";
import { useEffect, useState } from "react";
import crypto from "crypto";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { i18n } from "../../../i18n";
import { CustomInput } from "../CustomInput";
import { PageLayout } from "../layout/PageLayout";
import { CryptoAccountProps } from "../../pages/Crypto/Crypto.types";
import {
  getCryptoAccountsCache,
  setCryptoAccountsCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { ChooseAccountNameProps } from "./ChooseAccountName.types";
import "./ChooseAccountName.scss";

const ChooseAccountName = ({
  chooseAccountNameIsOpen,
  setChooseAccountNameIsOpen,
}: ChooseAccountNameProps) => {
  const dispatch = useAppDispatch();
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );
  const [accountName, setAccountName] = useState(
    `${i18n.t("crypto.chooseaccountnamemodal.placeholder")}`
  );
  const [keyboardIsOpen, setkeyboardIsOpen] = useState(false);

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

  const handleCreateWallet = (value: string) => {
    const newWallet: CryptoAccountProps = {
      name:
        value === "skip"
          ? i18n.t("crypto.chooseaccountnamemodal.placeholder") +
            " #" +
            crypto.randomBytes(3).toString("hex")
          : value,
      adaBalance: 273.85, // @TODO - sdisalvo: remove whenever we know where to pull this info from
      usdBalance: 75.2, // @TODO - sdisalvo: remove whenever we know where to pull this info from
      usesIdentitySeedPhrase: true,
    };
    dispatch(setCryptoAccountsCache([...cryptoAccountsData, newWallet]));
    setChooseAccountNameIsOpen(false);
  };

  return (
    <IonModal
      isOpen={chooseAccountNameIsOpen}
      initialBreakpoint={0.35}
      breakpoints={[0, 0.35]}
      className={`page-layout ${keyboardIsOpen ? "extended-modal" : ""}`}
      data-testid="choose-account-name"
      onDidDismiss={() => setChooseAccountNameIsOpen(false)}
    >
      <div className="choose-account-name modal">
        <PageLayout
          header={true}
          closeButton={false}
          title={`${i18n.t("crypto.chooseaccountnamemodal.title")}`}
          actionButton={true}
          actionButtonLabel={`${i18n.t("crypto.chooseaccountnamemodal.skip")}`}
          actionButtonAction={() => handleCreateWallet("skip")}
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
              onClick={() => handleCreateWallet(accountName)}
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

export { ChooseAccountName };
