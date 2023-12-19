import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
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
import { PageFooter } from "../../components/PageFooter";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";

const PasscodeLogin = () => {
  const pageId = "passcode-login";
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
      verifyPasscode(updatedPasscode).then((verified) => {
        if (verified) {
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
    <ResponsivePageLayout
      pageId={pageId}
      header={<PageHeader currentPath={RoutePath.PASSCODE_LOGIN} />}
    >
      <h2
        className="passcode-login-title"
        data-testid="passcode-login-title"
      >
        {i18n.t("passcodelogin.title")}
      </h2>
      <p
        className="passcode-login-description small-hide"
        data-testid="passcode-login-description"
      >
        {i18n.t("passcodelogin.description")}
      </p>
      <PasscodeModule
        error={
          <ErrorMessage
            message={
              passcode.length === 6 && passcodeIncorrect
                ? `${i18n.t("passcodelogin.error")}`
                : undefined
            }
            timeout={true}
          />
        }
        passcode={passcode}
        handlePinChange={handlePinChange}
        handleRemove={handleRemove}
      />
      <PageFooter
        pageId={pageId}
        secondaryButtonText={`${i18n.t("passcodelogin.forgotten.button")}`}
        secondaryButtonAction={() => setIsOpen(true)}
      />
      <Alert
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        dataTestId="alert-forgotten"
        headerText={headerText}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        actionConfirm={resetPasscode}
      />
    </ResponsivePageLayout>
  );
};

export { PasscodeLogin };
