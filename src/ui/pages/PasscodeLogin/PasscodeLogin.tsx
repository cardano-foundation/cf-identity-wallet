import { useState } from "react";
import { IonButton, IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PasscodeModule } from "../../components/PasscodeModule";
import { Alert } from "../../components/Alert";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateReduxState } from "../../../store/utils";
import "./PasscodeLogin.scss";
import { getBackRoute } from "../../../routes/backRoute";
import { RoutePath } from "../../../routes";
import {
  getAuthentication,
  setAuthentication,
} from "../../../store/reducers/stateCache";

const PasscodeLogin = () => {
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

  const handleClearState = () => {
    setPasscode("");
    setIsOpen(false);
    setPasscodeIncorrect(false);
  };

  const handlePinChange = (digit: number) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
      if (passcode.length === 5) {
        verifyPasscode(passcode + digit)
          .then((verified) => {
            if (verified) {
              const { backPath, updateRedux } = getBackRoute(
                RoutePath.PASSCODE_LOGIN
              );
              updateReduxState(backPath.pathname, {}, dispatch, updateRedux);
              history.push(backPath.pathname);
              handleClearState();
            } else {
              setPasscodeIncorrect(true);
            }
          })
          .catch((e) => e.code === -35 && setPasscodeIncorrect(true));
      }
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

  const handleForgotten = () => {
    resetPasscode();
  };

  const verifyPasscode = async (pass: string) => {
    try {
      const storedPass = (await SecureStorage.get(
        KeyStoreKeys.APP_PASSCODE
      )) as string;
      if (!storedPass) return false;
      return storedPass === pass;
    } catch (e) {
      return false;
    }
  };

  const resetPasscode = () => {
    SecureStorage.delete(KeyStoreKeys.APP_PASSCODE).then(() => {
      dispatch(setAuthentication({ ...authentication, passcodeIsSet: false }));
      history.push(RoutePath.SET_PASSCODE);
      handleClearState();
    });
  };

  return (
    <IonPage className="page-layout passcode-login safe-area">
      <PageLayout currentPath={RoutePath.PASSCODE_LOGIN}>
        <PasscodeModule
          title={i18n.t("passcodelogin.title")}
          description={i18n.t("passcodelogin.description")}
          error={
            passcode.length === 6 &&
            passcodeIncorrect && (
              <ErrorMessage
                message={`${i18n.t("passcodelogin.error")}`}
                timeout={true}
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
    </IonPage>
  );
};

export { PasscodeLogin };
