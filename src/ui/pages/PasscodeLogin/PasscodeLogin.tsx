import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import { GENERATE_SEED_PHRASE_ROUTE } from "../../../routes";
import { PasscodeModule } from "../../components/PasscodeModule";

const PasscodeLogin = ({ storedPasscode }: { storedPasscode: string }) => {
  const history = useHistory();
  const [passcode, setPasscode] = useState("");
  const seedPhrase = localStorage.getItem("seedPhrase");

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
    return;
  };

  useEffect(() => {
    if (passcode.length === 6) {
      history.push(GENERATE_SEED_PHRASE_ROUTE);
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
              onClick={handleForgotten}
              shape="round"
              expand="block"
              fill="outline"
              className="secondary-button"
            >
              {i18n.t("passcodelogin.forgotten.button")}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </PageLayout>
  );
};

export { PasscodeLogin };
