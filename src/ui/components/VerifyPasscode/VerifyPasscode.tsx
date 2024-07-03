import { IonModal } from "@ionic/react";
import { useState } from "react";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { i18n } from "../../../i18n";
import { Alert } from "../Alert";
import { ErrorMessage } from "../ErrorMessage";
import { ForgotAuthInfo } from "../ForgotAuthInfo";
import { ForgotType } from "../ForgotAuthInfo/ForgotAuthInfo.types";
import { PageFooter } from "../PageFooter";
import { PageHeader } from "../PageHeader";
import { PasscodeModule } from "../PasscodeModule";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import "./VerifyPasscode.scss";
import { VerifyPasscodeProps } from "./VerifyPasscode.types";

const VerifyPasscode = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasscodeProps) => {
  const componentId = "verify-passcode";
  const [passcode, setPasscode] = useState("");
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const [openRecoveryAuth, setOpenRecoveryAuth] = useState(false);

  const headerText = i18n.t("verifypasscode.alert.text.verify");
  const confirmButtonText = i18n.t("verifypasscode.alert.button.verify");
  const cancelButtonText = i18n.t("verifypasscode.alert.button.cancel");

  const handleClearState = () => {
    setPasscode("");
    setAlertIsOpen(false);
    setPasscodeIncorrect(false);
    setIsOpen(false);
  };

  const handlePinChange = (digit: number) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
      if (passcode.length === 5) {
        verifyPasscode(passcode + digit)
          .then((verified) => {
            if (verified) {
              onVerify();
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
    setOpenRecoveryAuth(true);
  };

  return (
    <IonModal
      isOpen={isOpen}
      className={componentId}
      data-testid={componentId}
      onDidDismiss={() => handleClearState()}
    >
      <ResponsivePageLayout
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("verifypasscode.cancel")}`}
            closeButtonAction={handleClearState}
          />
        }
        pageId={`${componentId}-content`}
      >
        <h2
          className="verify-passcode-title"
          data-testid="verify-passcode-title"
        >
          {i18n.t("verifypasscode.title")}
        </h2>
        <p
          className="verify-passcode-description small-hide"
          data-testid="verify-passcode-description"
        >
          {i18n.t("verifypasscode.description")}
        </p>
        <PasscodeModule
          error={
            <ErrorMessage
              message={
                passcode.length === 6 && passcodeIncorrect
                  ? `${i18n.t("verifypasscode.error")}`
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
          pageId={componentId}
          secondaryButtonText={`${i18n.t("verifypasscode.forgotten.button")}`}
          secondaryButtonAction={() => setAlertIsOpen(true)}
        />
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-forgotten"
          headerText={headerText}
          confirmButtonText={confirmButtonText}
          cancelButtonText={cancelButtonText}
          actionConfirm={resetPasscode}
        />
        <ForgotAuthInfo
          isOpen={openRecoveryAuth}
          onClose={() => setOpenRecoveryAuth(false)}
          type={ForgotType.Passcode}
        />
      </ResponsivePageLayout>
    </IonModal>
  );
};

export { VerifyPasscode };
