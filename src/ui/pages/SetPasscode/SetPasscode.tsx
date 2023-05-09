import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { randomBytes } from "crypto";
import { hash, ArgonType } from "argon2-browser";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  SecureStorage,
  KeyStoreKeys,
} from "../../../core/storage/secureStorage";
import { ROUTES } from "../../../routes";
import { PasscodeModule } from "../../components/PasscodeModule";
import { getState, setCurrentRoute } from "../../../store/reducers/StateCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getNextRoute } from "../../../routes/Rules";

// Based on OWASP recommendations
const ARGON2ID_OPTIONS = {
  type: ArgonType.Argon2id,
  mem: 19456,
  time: 2,
  parallelism: 1,
  hashLen: 32,
};

const SetPasscode = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);
  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");

  const handlePinChange = (digit: number) => {
    const length = passcode.length;
    if (length < 6) {
      if (originalPassCode !== "" && length === 5) {
        if (originalPassCode === passcode + digit) {
          hash({
            pass: originalPassCode,
            salt: randomBytes(16),
            ...ARGON2ID_OPTIONS,
          }).then((hash) => {
            SecureStorage.set(KeyStoreKeys.APP_PASSCODE, hash.encoded).then(
              () => {
                handleClear();

                const { nextPath, updateRedux } = getNextRoute(
                  ROUTES.SET_PASSCODE_ROUTE,
                  storeState
                );
                if (nextPath?.canNavigate) {
                  dispatch(updateRedux());
                  dispatch(setCurrentRoute({ path: nextPath.pathname }));
                  history.push(nextPath.pathname);
                }
              }
            );
          });
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

  useEffect(() => {
    if (passcode.length === 6 && originalPassCode === "") {
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  }, [originalPassCode, passcode]);

  return (
    <PageLayout
      backButton={true}
      backButtonPath={"/"}
      contentClasses=""
      progressBar={true}
      progressBarValue={0.33}
      progressBarBuffer={1}
    >
      <PasscodeModule
        title={
          originalPassCode !== ""
            ? i18n.t("setpasscode.reenterpasscode.title")
            : i18n.t("setpasscode.enterpasscode.title")
        }
        description={i18n.t("setpasscode.enterpasscode.description")}
        error={
          originalPassCode !== "" &&
          passcode.length === 6 &&
          originalPassCode !== passcode && (
            <ErrorMessage message={i18n.t("setpasscode.enterpasscode.error")} />
          )
        }
        passcode={passcode}
        handlePinChange={handlePinChange}
        handleRemove={handleRemove}
      />
      <IonGrid>
        <IonRow>
          <IonCol className="continue-col">
            {originalPassCode !== "" && (
              <IonButton
                onClick={() => handleClear()}
                shape="round"
                expand="block"
                fill="outline"
                className="secondary-button"
              >
                {i18n.t("setpasscode.startover.label")}
              </IonButton>
            )}
          </IonCol>
        </IonRow>
      </IonGrid>
    </PageLayout>
  );
};

export { SetPasscode, ARGON2ID_OPTIONS };
