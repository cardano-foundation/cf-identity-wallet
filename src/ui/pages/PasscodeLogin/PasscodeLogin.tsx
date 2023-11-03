import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import {
  ErrorMessage,
  MESSAGE_MILLISECONDS,
} from "../../components/ErrorMessage";
import { PasscodeModule } from "../../components/PasscodeModule";
import { Alert } from "../../components/Alert";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getStateCache,
  setAuthentication,
  setCurrentRoute,
  setPauseQueueConnectionCredentialRequest,
} from "../../../store/reducers/stateCache";
import { updateReduxState } from "../../../store/utils";
import "./PasscodeLogin.scss";
import { getBackRoute } from "../../../routes/backRoute";
import { RoutePath } from "../../../routes";

const PasscodeLogin = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = authentication.seedPhraseIsSet;
  const [isOpen, setIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const headerText = seedPhrase
    ? i18n.t("passcodelogin.alert.text.verify")
    : i18n.t("passcodelogin.alert.text.restart");
  const confirmButtonText = seedPhrase
    ? i18n.t("passcodelogin.alert.button.verify")
    : i18n.t("passcodelogin.alert.button.restart");
  const cancelButtonText = i18n.t("passcodelogin.alert.button.cancel");

  const handleClearState = () => {
    setIsOpen(false);
    setPasscodeIncorrect(false);
    setPasscode("");
  };

  useEffect(() => {
    if (passcodeIncorrect) {
      setTimeout(() => {
        setPasscodeIncorrect(false);
      }, MESSAGE_MILLISECONDS);
    }
  }, [passcodeIncorrect]);

  const handlePinChange = (digit: number) => {
    const updatedPasscode = `${passcode}${digit}`;

    if (updatedPasscode.length <= 6) setPasscode(updatedPasscode);

    if (updatedPasscode.length === 6) {
      verifyPasscode(updatedPasscode)
        .then((verified) => {
          if (verified) {
            setPasscodeIncorrect(false);
            setPasscode("");
            const { backPath, updateRedux } = getBackRoute(
              RoutePath.PASSCODE_LOGIN,
              {
                store: { stateCache },
              }
            );
            updateReduxState(
              backPath.pathname,
              { store: { stateCache } },
              dispatch,
              updateRedux
            );

            history.push(backPath.pathname);
            handleClearState();

            setTimeout(() => {
              dispatch(setPauseQueueConnectionCredentialRequest(false));
            }, 500);
          } else {
            setPasscodeIncorrect(true);
          }
        })
        .catch((e) => {
          e.code === -35 && setPasscodeIncorrect(true);
        });
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
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
      dispatch(
        setAuthentication({
          ...authentication,
          passcodeIsSet: false,
        })
      );
      dispatch(
        setCurrentRoute({
          path: RoutePath.SET_PASSCODE,
        })
      );
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
          handlePinChange={(number: number) => handlePinChange(number)}
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
          dataTestId="alert-forgotten"
          headerText={headerText}
          confirmButtonText={confirmButtonText}
          cancelButtonText={cancelButtonText}
          actionConfirm={resetPasscode}
        />
      </PageLayout>
    </IonPage>
  );
};

export { PasscodeLogin };
