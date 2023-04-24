import { useState } from "react";
import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { randomBytes } from "crypto";
import { Argon2, Argon2Mode } from "@sphereon/isomorphic-argon2";
import { i18n } from "../../../i18n";
import "./PasscodeLogin.scss";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  SecureStorage,
  KeyStoreKeys,
} from "../../../core/storage/secureStorage";
import { GENERATE_SEED_PHRASE_ROUTE } from "../../../routes";
import { PasscodeModule } from "../../components/PasscodeModule";

// Based on OWASP recommendations
const ARGON2ID_OPTIONS = {
  mode: Argon2Mode.Argon2id,
  memory: 19456,
  iterations: 2,
  parallelism: 1,
};

const PasscodeLogin = () => {
  const history = useHistory();
  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");

  const handlePinChange = (digit: number) => {
    const length = passcode.length;
    if (length < 6) {
      if (originalPassCode !== "" && length === 5) {
        if (originalPassCode === passcode + digit) {
          Argon2.hash(originalPassCode, randomBytes(16), ARGON2ID_OPTIONS).then(
            (hash) => {
              SecureStorage.set(KeyStoreKeys.APP_PASSCODE, hash.encoded).then(
                () => {
                  handleClear();
                  history.push(GENERATE_SEED_PHRASE_ROUTE);
                  return;
                }
              );
            }
          );
        }
      }
      setPasscode(passcode + digit);
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

  const handleClear = () => {
    setPasscode("");
    setOriginalPassCode("");
  };

  const handleContinue = () => {
    if (passcode.length === 6) {
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  };

  return (
    <>
      <PageLayout
        backButton={true}
        backButtonPath={"/"}
        contentClasses=""
        progressBar={true}
        progressBarValue={0.3}
        progressBarBuffer={1}
      >
        <PasscodeModule
          title={
            originalPassCode !== ""
              ? i18n.t("setpasscode.reenterpasscode.label")
              : i18n.t("setpasscode.enterpasscode.label")
          }
          description={i18n.t("setpasscode.enterpasscode.description")}
          error={
            originalPassCode !== "" &&
            passcode.length === 6 &&
            originalPassCode !== passcode && (
              <ErrorMessage
                message={i18n.t("setpasscode.enterpasscode.error")}
              />
            )
          }
          passcode={passcode}
          handlePinChange={handlePinChange}
          handleRemove={handleRemove}
        />
        <IonGrid>
          <IonRow>
            <IonCol className="continue-col">
              {!(originalPassCode !== "") ? (
                <IonButton
                  onClick={() => handleContinue()}
                  disabled={passcode.length < 6}
                  shape="round"
                  expand="block"
                  className="ion-primary-button continue-button"
                  data-testid="setpasscode-continue-button"
                >
                  {i18n.t("setpasscode.continue.button")}
                </IonButton>
              ) : (
                <IonButton
                  onClick={() => handleClear()}
                  shape="round"
                  expand="block"
                  fill="outline"
                  className="continue-button"
                >
                  {i18n.t("setpasscode.startover.label")}
                </IonButton>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </>
  );
};

export { PasscodeLogin, ARGON2ID_OPTIONS };
