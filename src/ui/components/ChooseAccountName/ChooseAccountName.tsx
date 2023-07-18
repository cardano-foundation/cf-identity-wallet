import { IonModal, IonGrid, IonRow, IonCol, IonButton } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
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
  setDefaultCryptoAccountCache,
} from "../../../store/reducers/cryptoAccountsCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { ChooseAccountNameProps } from "./ChooseAccountName.types";
import "./ChooseAccountName.scss";
import CardanoLogo from "../../assets/images/CardanoLogo.jpg";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { SeedPhraseStorageService } from "../../../core/storage/services";

const seedPhraseStorageService = new SeedPhraseStorageService();

const ChooseAccountName = ({
  chooseAccountNameIsOpen,
  setChooseAccountNameIsOpen,
  setDefaultAccountData,
}: ChooseAccountNameProps) => {
  const dispatch = useAppDispatch();
  const seedPhraseStorageService = useRef(new SeedPhraseStorageService());
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

  const handleCreateWallet = (displayName?: string) => {
    const name =
      displayName ??
      `${i18n.t("crypto.chooseaccountnamemodal.placeholder")} #${crypto
        .randomBytes(3)
        .toString("hex")}`;
    seedPhraseStorageService.current
      .createCryptoAccountFromIdentitySeedPhrase(name)
      .then(() => {
        const newWallet: CryptoAccountProps = {
          name,
          usesIdentitySeedPhrase: true,
          // @TODO - sdisalvo: remember to remove hardcoded values below this point
          address:
            "stake1ux3d3808s26u3ep7ps24sxyxe7qlt5xh783tc7a304yq0wg7j8cu8",
          blockchain: "Cardano",
          currency: "ADA",
          logo: CardanoLogo,
          balance: {
            main: {
              nativeBalance: 273.85,
              usdBalance: 75.2,
            },
            reward: {
              nativeBalance: 0,
              usdBalance: 0,
            },
          },
          assets: [],
          transactions: [],
          // End of hardcoded values
        };
        if (cryptoAccountsData.length === 0) {
          dispatch(setDefaultCryptoAccountCache(newWallet.address));
          PreferencesStorage.set(PreferencesKeys.APP_DEFAULT_CRYPTO_ACCOUNT, {
            data: newWallet.address,
          });
          setDefaultAccountData(newWallet);
        }
        dispatch(setCryptoAccountsCache([...cryptoAccountsData, newWallet]));
        setChooseAccountNameIsOpen(false);
      })
      .catch((err) => {
        // @TODO - handle exceptions in the UI story here
        throw err;
      });
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
          actionButtonAction={() => handleCreateWallet()}
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
