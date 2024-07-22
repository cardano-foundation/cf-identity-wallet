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
import { useRef, useState } from "react";
import { chevronForward } from "ionicons/icons";
import { i18n } from "../../../../../../../i18n";
import { VerifyPassword } from "../../../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../../../components/VerifyPasscode";
import { getStateCache } from "../../../../../../../store/reducers/stateCache";
import {
  Alert as AlertEnable,
  Alert as AlertDisable,
} from "../../../../../../components/Alert";
import { CreatePassword } from "../../../../../CreatePassword";
import { KeyStoreKeys, SecureStorage } from "../../../../../../../core/storage";

const ManagePassword = () => {
  const stateCache = useSelector(getStateCache);
  const userAction = useRef("");
  const [passwordIsSet, setPasswordIsSet] = useState(
    stateCache?.authentication.passwordIsSet
  );
  const [alertEnableIsOpen, setAlertEnableIsOpen] = useState(false);
  const [alertDisableIsOpen, setAlertDisableIsOpen] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const [createPasswordModalIsOpen, setCreatePasswordModalIsOpen] =
    useState(false);

  const handleToggle = () => {
    if (passwordIsSet) {
      userAction.current = "disable";
      setAlertDisableIsOpen(true);
    } else {
      userAction.current = "enable";
      setAlertEnableIsOpen(true);
    }
  };

  const handleClear = () => {
    setAlertEnableIsOpen(false);
    setAlertDisableIsOpen(false);
    userAction.current = "";
  };

  const onVerify = async () => {
    if (passwordIsSet && userAction.current === "disable") {
      await SecureStorage.set(KeyStoreKeys.APP_OP_PASSWORD, "");
      setPasswordIsSet(false);
      userAction.current = "";
    } else {
      setCreatePasswordModalIsOpen(true);
    }
  };

  const handleChange = () => {
    userAction.current = "change";
    setVerifyPasswordIsOpen(true);
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
      <AlertEnable
        isOpen={alertEnableIsOpen}
        setIsOpen={setAlertEnableIsOpen}
        dataTestId="alert-cancel"
        headerText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.enablemessage"
        )}`}
        confirmButtonText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.cancel"
        )}`}
        actionConfirm={() => setVerifyPasscodeIsOpen(true)}
        actionCancel={() => handleClear()}
        actionDismiss={() => handleClear()}
      />
      <AlertDisable
        isOpen={alertDisableIsOpen}
        setIsOpen={setAlertDisableIsOpen}
        dataTestId="alert-cancel"
        headerText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.disablemessage"
        )}`}
        confirmButtonText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "settings.sections.security.managepassword.page.alert.cancel"
        )}`}
        actionConfirm={() => setVerifyPasswordIsOpen(true)}
        actionCancel={() => handleClear()}
        actionDismiss={() => handleClear()}
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
        onDidDismiss={() => handleClear()}
      >
        <CreatePassword
          isModal={true}
          handleClear={handleClear}
          setPasswordIsSet={setPasswordIsSet}
          userAction={userAction}
        />
      </IonModal>
    </>
  );
};

export { ManagePassword };
