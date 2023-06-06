import { IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { VerifyPasswordProps } from "./VerifyPassword.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";

const VerifyPassword = ({ isOpen, setIsOpen }: VerifyPasswordProps) => {
  const [verifyPasswordValue, setVerifyPasswordValue] = useState("");
  const [verifyPasswordFocus, setVerifyPasswordFocus] = useState(false);
  const storedPassword = "Cardano1$";
  const passwordValueMatching =
    verifyPasswordValue.length > 0 && verifyPasswordValue === storedPassword;
  const errorMessages = {
    hasNoMatch: i18n.t("verifypassword.error.hasNoMatch"),
  };

  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.5}
      breakpoints={[0.5]}
      className="page-layout"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="verify-password modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonAction={() => setIsOpen(false)}
          title={`${i18n.t("verifypassword.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <CustomInput
                  dataTestId="verify-password-value"
                  hiddenInput={true}
                  onChangeInput={setVerifyPasswordValue}
                  onChangeFocus={setVerifyPasswordFocus}
                  value={verifyPasswordValue}
                />
              </IonCol>
            </IonRow>
            {!passwordValueMatching ? (
              <ErrorMessage
                message={errorMessages.hasNoMatch}
                timeout={false}
              />
            ) : null}
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { VerifyPassword };
