import {
  IonCard,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { i18n } from "../../../../../../../i18n";
import { useAppDispatch } from "../../../../../../../store/hooks";
import { VerifyPassword } from "../../../../../../components/VerifyPassword";
import { VerifyPasscode } from "../../../../../../components/VerifyPasscode";
import { getStateCache } from "../../../../../../../store/reducers/stateCache";
import { SubMenuKey } from "../../../../Menu.types";

const ManagePassword = () => {
  const pageId = "manage-password";
  const dispatch = useAppDispatch();
  const stateCache = useSelector(getStateCache);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  const handleToggle = () => {
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const onVerify = () => {
    // TODO: switch on/off password
  };

  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCard>
            <IonList
              lines="none"
              data-testid="settings-manage-password-page"
            >
              <IonItem className="security-item">
                <IonLabel>
                  {i18n.t(
                    "settings.sections.security.managepassword.page.enable"
                  )}
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCard>
        </IonRow>
      </IonGrid>
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
    </>
  );
};

export { ManagePassword };
