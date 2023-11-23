import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { ErrorMessage } from "../../components/ErrorMessage";
import { SecureStorage, KeyStoreKeys } from "../../../core/storage";
import { PasscodeModule } from "../../components/PasscodeModule";
import {
  getStateCache,
  setInitialized,
} from "../../../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { RoutePath } from "../../../routes";
import {
  PreferencesKeys,
  PreferencesStorage,
} from "../../../core/storage/preferences";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";
import "./SetPasscode.scss";
import PageFooter from "../../components/PageFooter/PageFooter";

const SetPasscode = () => {
  const pageId = "set-passcode";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");

  const handlePinChange = (digit: number) => {
    if (passcode.length < 6) {
      if (originalPassCode !== "" && passcode.length === 5) {
        if (originalPassCode === passcode + digit) {
          SecureStorage.set(KeyStoreKeys.APP_PASSCODE, originalPassCode).then(
            () => {
              const data: DataProps = {
                store: { stateCache },
              };
              const { nextPath, updateRedux } = getNextRoute(
                RoutePath.SET_PASSCODE,
                data
              );
              updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
              history.push(nextPath.pathname);
              handleClearState();

              PreferencesStorage.set(PreferencesKeys.APP_ALREADY_INIT, {
                initialized: true,
              }).then(() => dispatch(setInitialized(true)));
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

  const handleClearState = () => {
    setPasscode("");
    setOriginalPassCode("");
  };

  const handleBeforeBack = () => {
    handleClearState();
  };

  useEffect(() => {
    if (passcode.length === 6 && originalPassCode === "") {
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  }, [originalPassCode, passcode]);

  return (
    <ResponsivePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          beforeBack={handleBeforeBack}
          currentPath={RoutePath.SET_PASSCODE}
          progressBar={true}
          progressBarValue={0.33}
          progressBarBuffer={1}
        />
      }
    >
      <h2
        className="set-passcode-title"
        data-testid="set-passcode-title"
      >
        {originalPassCode !== ""
          ? i18n.t("setpasscode.reenterpasscode.title")
          : i18n.t("setpasscode.enterpasscode.title")}
      </h2>
      <p
        className="set-passcode-description small-hide"
        data-testid="set-passcode-description"
      >
        {i18n.t("setpasscode.enterpasscode.description")}
      </p>
      <PasscodeModule
        error={
          <ErrorMessage
            message={
              originalPassCode !== "" &&
              passcode.length === 6 &&
              originalPassCode !== passcode
                ? `${i18n.t("setpasscode.enterpasscode.error")}`
                : undefined
            }
            timeout={true}
          />
        }
        passcode={passcode}
        handlePinChange={handlePinChange}
        handleRemove={handleRemove}
      />
      {originalPassCode !== "" ? (
        <PageFooter
          pageId={pageId}
          secondaryButtonText={`${i18n.t("setpasscode.startover.label")}`}
          secondaryButtonAction={() => handleClearState()}
        />
      ) : (
        <div
          className="forgot-your-passcode-placeholder"
          data-testid="forgot-your-passcode-placeholder"
        />
      )}
    </ResponsivePageLayout>
  );
};

export { SetPasscode };
