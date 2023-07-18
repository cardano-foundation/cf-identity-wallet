import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import {
  SecureStorage,
  KeyStoreKeys,
} from "../../../core/storage/secureStorage";
import { PasscodeModule } from "../../components/PasscodeModule";
import {getStateCache} from "../../../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { RoutePath } from "../../../routes";

const SetPasscode = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const [passcode, setPasscode] = useState("");
  const [originalPassCode, setOriginalPassCode] = useState("");
  const handlePinChange = (digit: number) => {
    const length = passcode.length;
    if (length < 6) {
      if (originalPassCode !== "" && length === 5) {
        if (originalPassCode === passcode + digit) {
          SecureStorage.set(KeyStoreKeys.APP_PASSCODE, originalPassCode).then(
            () => {
              handleClearState();

              const data: DataProps = {
                store: {stateCache},
              };
              const { nextPath, updateRedux } = getNextRoute(
                RoutePath.SET_PASSCODE,
                data
              );
              updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
              history.push(nextPath.pathname);
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

  const handleOnBack = () => {
    handleClearState();
  };

  useEffect(() => {
    if (passcode.length === 6 && originalPassCode === "") {
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  }, [originalPassCode, passcode]);

  return (
    <IonPage className="page-layout">
      <PageLayout
        header={true}
        backButton={true}
        onBack={handleOnBack}
        currentPath={RoutePath.SET_PASSCODE}
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
              <ErrorMessage
                message={`${i18n.t("setpasscode.enterpasscode.error")}`}
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
              {originalPassCode !== "" && (
                <IonButton
                  onClick={() => handleClearState()}
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
    </IonPage>
  );
};

export { SetPasscode };
