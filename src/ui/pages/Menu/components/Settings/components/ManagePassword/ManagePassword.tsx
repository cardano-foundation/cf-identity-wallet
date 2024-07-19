import {
  IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonToggle,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { chevronForward } from "ionicons/icons";
import { i18n } from "../../../../../../../i18n";
import { VerifyPassword } from "../../../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../../../components/VerifyPasscode";
import { getStateCache } from "../../../../../../../store/reducers/stateCache";
import { Alert } from "../../../../../../components/Alert";
import { CreatePassword } from "../../../../../CreatePassword";
import { KeyStoreKeys, SecureStorage } from "../../../../../../../core/storage";

const ManagePassword = () => {
  const stateCache = useSelector(getStateCache);
  const [passwordIsSet, setPasswordIsSet] = useState(
    stateCache?.authentication.passwordIsSet
  );
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [createPasswordModalIsOpen, setCreatePasswordModalIsOpen] =
    useState(false);

  const handleToggle = () => {
    if (passwordIsSet) {
      setVerifyPasswordIsOpen(true);
    } else {
      setAlertIsOpen(true);
    }
  };

  const onVerify = async () => {
    if (passwordIsSet) {
      await SecureStorage.set(KeyStoreKeys.APP_OP_PASSWORD, "");
      setPasswordIsSet(false);
    } else {
      setCreatePasswordModalIsOpen(true);
    }
  };

  const handleChange = () => {
    // TODO: change password
  };

  return (
    <>
      <div className="settings-section-title-placeholder" />
      <IonCard>
        <IonList
          lines="none"
          data-testid="settings-security-items"
        >
          <IonItem
            onClick={() => handleToggle()}
            className="settings-item"
            data-testid={"settings-item-toggle-password"}
          >
            <IonLabel>
              {i18n.t("settings.sections.security.managepassword.page.enable")}
            </IonLabel>
            <IonToggle
              aria-label={`${i18n.t(
                "settings.sections.security.managepassword.page.enable"
              )}`}
              className="toggle-button"
              checked={passwordIsSet}
            />
          </IonItem>
        </IonList>
      </IonCard>
      {passwordIsSet && (
        <IonCard>
          <IonList
            lines="none"
            data-testid="settings-security-items"
          >
            <IonItem
              onClick={() => handleChange()}
              className="settings-item"
              data-testid={"settings-item-change-password"}
            >
              <IonLabel>{`${i18n.t(
                "settings.sections.security.managepassword.page.change"
              )}`}</IonLabel>

              <IonIcon
                aria-hidden="true"
                icon={chevronForward}
                slot="end"
              />
            </IonItem>
          </IonList>
        </IonCard>
      )}
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-cancel"
        headerText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.message"
        )}`}
        confirmButtonText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.cancel"
        )}`}
        actionConfirm={() => setVerifyPasscodeIsOpen(true)}
        actionCancel={() => setAlertIsOpen(false)}
        actionDismiss={() => setAlertIsOpen(false)}
      />
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={onVerify}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={onVerify}
      />
      <IonModal
        isOpen={createPasswordModalIsOpen}
        className="create-password-modal"
        data-testid="create-password-modal"
        onDidDismiss={() => setCreatePasswordModalIsOpen(false)}
      >
        <CreatePassword
          isModal={true}
          setCreatePasswordModalIsOpen={setCreatePasswordModalIsOpen}
          setPasswordIsSet={setPasswordIsSet}
        />
      </IonModal>
    </>
  );
};

export { ManagePassword };
