import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { verify } from "argon2-browser";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ONBOARDING_ROUTE, SET_PASSCODE_ROUTE } from "../../../routes";
import { PasscodeModule } from "../../components/PasscodeModule";
import Alert from "../../components/Alert/Alert";
import { SecureStorage } from "../../../core/storage/secureStorage";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import {getAuthentication, setAuthentication} from "../../../store/reducers/StateCache";
import Moment from "moment";

const PasscodeLogin = ({ storedPasscode }: { storedPasscode: string }) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = localStorage.getItem("seedPhrase");
  const [isOpen, setIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const headerText =
    seedPhrase !== null
      ? i18n.t("passcodelogin.alert.text.verify")
      : i18n.t("passcodelogin.alert.text.restart");
  const confirmButtonText =
    seedPhrase !== null
      ? i18n.t("passcodelogin.alert.button.verify")
      : i18n.t("passcodelogin.alert.button.restart");
  const cancelButtonText = i18n.t("passcodelogin.alert.button.cancel");

  const handlePinChange = (digit: number) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

  const handleForgotten = () => {
    seedPhrase !== null
      ? // TODO: Go to Verify your Seed Phrase
        history.push("/verifyseedphrase")
      : resetPasscode();
  };

  const resetPasscode = () => {
    SecureStorage.delete("app-login-passcode");
    history.push(SET_PASSCODE_ROUTE);
  };

  useEffect(() => {
    if (passcode.length === 6) {
      verify({ encoded: storedPasscode, pass: passcode })
        .then(() =>
            {
              setAuthentication({ ...authentication, time: Moment.utc().millisecond() })
              seedPhrase !== null
                  ? // TODO: Proceed to main landing page
                  history.push("/dids")
                  : history.push(ONBOARDING_ROUTE)
            }
        )
        .catch((e) => e.code === -35 && setPasscodeIncorrect(true));
    }
  }, [history, passcode, seedPhrase, storedPasscode]);

  return (
    <PageLayout
      backButton={false}
      backButtonPath={"/"}
      contentClasses=""
      progressBar={false}
      progressBarValue={0}
      progressBarBuffer={1}
    >
      <PasscodeModule
        title={i18n.t("passcodelogin.title")}
        description={i18n.t("passcodelogin.description")}
        error={
          passcode.length === 6 &&
          passcodeIncorrect && (
            <ErrorMessage message={i18n.t("passcodelogin.error")} />
          )
        }
        passcode={passcode}
        handlePinChange={handlePinChange}
        handleRemove={handleRemove}
      />
      <IonGrid>
        <IonRow>
          <IonCol className="continue-col">
            <IonButton
              shape="round"
              expand="block"
              fill="outline"
              className="secondary-button"
              onClick={() => setIsOpen(true)}
            >
              {i18n.t("passcodelogin.forgotten.button")}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
      <Alert
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        headerText={headerText}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        actionConfirm={handleForgotten}
      />
    </PageLayout>
  );
};

export { PasscodeLogin };
