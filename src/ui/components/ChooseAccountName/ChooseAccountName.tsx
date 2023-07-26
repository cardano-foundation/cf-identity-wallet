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
} from "../../../store/reducers/cryptoAccountsCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { ChooseAccountNameProps } from "./ChooseAccountName.types";
import "./ChooseAccountName.scss";
import CardanoLogo from "../../assets/images/CardanoLogo.jpg";
import { SeedPhraseStorageService } from "../../../core/storage/services";

const ChooseAccountName = ({
  chooseAccountNameIsOpen,
  setChooseAccountNameIsOpen,
  seedPhrase,
  usesIdentitySeedPhrase,
  onDone,
}: ChooseAccountNameProps) => {
  const dispatch = useAppDispatch();
  const seedPhraseStorageService = useRef(new SeedPhraseStorageService());
  const cryptoAccountsData: CryptoAccountProps[] = useAppSelector(
    getCryptoAccountsCache
  );
  const [accountName, setAccountName] = useState("");
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

  const handleCreateWallet = async (displayName?: string) => {
    const name =
      displayName ??
      `${i18n.t("crypto.chooseaccountnamemodal.placeholder")} #${crypto
        .randomBytes(3)
        .toString("hex")}`;

    const newWallet: CryptoAccountProps = {
      name,
      usesIdentitySeedPhrase: usesIdentitySeedPhrase,
      // @TODO - sdisalvo: remember to remove hardcoded values below this point
      address: "stake1ux3d3808s26u3ep7ps24sxyxe7qlt5xh783tc7a304yq0wg7j8cu8",
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

    if (usesIdentitySeedPhrase) {
      await seedPhraseStorageService.current.createCryptoAccountFromIdentitySeedPhrase(
        name
      );
    } else if (seedPhrase) {
      await seedPhraseStorageService.current.createCryptoAccountFromSeedPhrase(
        name,
        seedPhrase
      );
    } else {
      throw new Error(
        "Tried to create a new crypto wallet from seed phrase, but no seed phrase was provided to the component"
      );
    }

    dispatch(setCryptoAccountsCache([...cryptoAccountsData, newWallet]));
    setChooseAccountNameIsOpen(false);
    if (onDone) {
      onDone();
    }
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
              disabled={!accountName.length}
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
