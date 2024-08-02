import { IonCheckbox, IonItem, IonList } from "@ionic/react";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { i18n } from "../../../../../../../i18n";
import { getStateCache } from "../../../../../../../store/reducers/stateCache";
import { OptionModal } from "../../../../../../components/OptionsModal";
import { PageFooter } from "../../../../../../components/PageFooter";
import { VerifyPasscode } from "../../../../../../components/VerifyPasscode";
import {
  ConditionItemProps,
  ConfirmModalProps,
} from "./RecoverySeedPhrase.types";
import { VerifyPassword } from "../../../../../../components/VerifyPassword";
import "./RecoverySeedPhrase.scss";

const ConditionItem = ({
  text,
  index,
  checked,
  onClick,
}: ConditionItemProps) => {
  return (
    <IonItem
      data-testid={`condition-item-${index}`}
      className="condition-item"
      onClick={(e) => {
        e.stopPropagation();
        onClick(index);
      }}
    >
      <div className="text">
        <p data-testid={`condition-title-${index}`}>{text}</p>
      </div>
      <IonCheckbox
        checked={checked}
        aria-label=""
        className="checkbox"
        slot="end"
        data-testid={`condition-select-${index}`}
      />
    </IonItem>
  );
};

const ConfirmModal = ({
  isOpen,
  setIsOpen,
  onShowPhrase: onVerify,
}: ConfirmModalProps) => {
  const stateCache = useSelector(getStateCache);
  const [confirmCondition, setConfirmCondition] = useState([
    false,
    false,
    false,
  ]);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);
  const isAcceptAll = confirmCondition.every((item) => item);

  const resetModal = useCallback(() => {
    setConfirmCondition([false, false, false]);
    setIsOpen(false);
  }, [setIsOpen]);

  const onConditionClick = (index: number) => {
    confirmCondition[index] = !confirmCondition[index];
    setConfirmCondition([...confirmCondition]);
  };

  const headerOptions = useMemo(
    () => ({
      closeButton: true,
      closeButtonLabel: `${i18n.t(
        "settings.sections.security.seedphrase.page.confirmmodal.button.cancel"
      )}`,
      closeButtonAction: resetModal,
      title: `${i18n.t(
        "settings.sections.security.seedphrase.page.confirmmodal.title"
      )}`,
    }),
    [resetModal]
  );

  const handleAuthentication = () => {
    setIsOpen(false);
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  return (
    <>
      <OptionModal
        modalIsOpen={isOpen}
        componentId="confirm-view-seedpharse"
        customClasses="confirm-view-seedpharse"
        onDismiss={resetModal}
        header={headerOptions}
      >
        <p className="subtitle">
          {i18n.t(
            "settings.sections.security.seedphrase.page.confirmmodal.subtitle"
          )}
        </p>
        <IonList>
          <ConditionItem
            text={i18n.t(
              "settings.sections.security.seedphrase.page.confirmmodal.firstcondition"
            )}
            index={0}
            checked={confirmCondition[0]}
            onClick={onConditionClick}
          />
          <ConditionItem
            text={i18n.t(
              "settings.sections.security.seedphrase.page.confirmmodal.secondcondition"
            )}
            index={1}
            checked={confirmCondition[1]}
            onClick={onConditionClick}
          />
          <ConditionItem
            text={i18n.t(
              "settings.sections.security.seedphrase.page.confirmmodal.thirdcondition"
            )}
            index={2}
            checked={confirmCondition[2]}
            onClick={onConditionClick}
          />
        </IonList>
        <PageFooter
          pageId="confirm-view-seedpharse"
          primaryButtonText={`${i18n.t(
            "settings.sections.security.seedphrase.page.confirmmodal.button.confirm"
          )}`}
          primaryButtonAction={handleAuthentication}
          primaryButtonDisabled={!isAcceptAll}
        />
      </OptionModal>
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

export { ConfirmModal };
