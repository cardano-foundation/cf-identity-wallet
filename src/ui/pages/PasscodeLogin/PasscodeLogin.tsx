import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ONBOARDING_ROUTE } from "../../../routes";
import { PasscodeModule } from "../../components/PasscodeModule";
import Alert from "../../components/Alert/Alert";

const PasscodeLogin = ({ storedPasscode }: { storedPasscode: string }) => {
  const history = useHistory();
  const [passcode, setPasscode] = useState("");
  const seedPhrase = localStorage.getItem("seedPhrase");
  const [isOpen, setIsOpen] = useState(false);
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
      ? alert("Verify your Seed Phrase")
      : alert("Delete current passcode and restart journey");
  };

  useEffect(() => {
    if (passcode.length === 6) {
      seedPhrase !== null
        ? alert("Proceed to main landing page")
        : history.push(ONBOARDING_ROUTE);
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
          storedPasscode !== passcode && (
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
