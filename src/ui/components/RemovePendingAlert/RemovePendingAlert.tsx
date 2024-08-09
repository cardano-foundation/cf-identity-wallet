import { useState } from "react";
import { alertCircleOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { Alert } from "../Alert";
import { OptionModal } from "../OptionsModal";
import { RemovePendingAlertProps } from "./RemovePendingAlert.types";
import { i18n } from "../../../i18n";
import { PageFooter } from "../PageFooter";
import "./RemovePendingAlert.scss";
import { VerifyPassword } from "../VerifyPassword";
import { VerifyPasscode } from "../VerifyPasscode";
import { useAppSelector } from "../../../store/hooks";
import { getStateCache } from "../../../store/reducers/stateCache";
import { CardDetailsBlock } from "../CardDetails";

const RemovePendingAlert = ({
  pageId,
  openFirstCheck,
  secondCheckTitle,
  onClose,
  firstCheckProps,
  onDeletePendingItem,
}: RemovePendingAlertProps) => {
  const alertId = `${pageId}-delete-pending-modal`;
  const stateCache = useAppSelector(getStateCache);
  const [isOpenSecondCheck, setOpenSecondCheck] = useState(false);
  const [verifyPasswordIsOpen, setVerifyPasswordIsOpen] = useState(false);
  const [verifyPasscodeIsOpen, setVerifyPasscodeIsOpen] = useState(false);

  const handleConfirm = () => {
    handleCloseSecondCheck();
    if (
      !stateCache?.authentication.passwordIsSkipped &&
      stateCache?.authentication.passwordIsSet
    ) {
      setVerifyPasswordIsOpen(true);
    } else {
      setVerifyPasscodeIsOpen(true);
    }
  };

  const handleCloseSecondCheck = () => {
    setOpenSecondCheck(false);
  };

  const deleteItem = () => {
    setVerifyPasswordIsOpen(false);
    setVerifyPasscodeIsOpen(false);
    onDeletePendingItem();
  };

  const openSecondCheck = () => {
    onClose();
    setOpenSecondCheck(true);
  };

  return (
    <>
      <OptionModal
        modalIsOpen={openFirstCheck}
        customClasses="delete-pending-modal"
        onDismiss={onClose}
        componentId={alertId}
        header={{
          closeButton: true,
          closeButtonLabel: `${i18n.t("removependingalert.button.done")}`,
          closeButtonAction: onClose,
          title: firstCheckProps.title,
        }}
      >
        <CardDetailsBlock className="user-tips">
          <p className="alert-description">{firstCheckProps.description}</p>
          <div className="alert-icon">
            <IonIcon
              icon={alertCircleOutline}
              slot="icon-only"
            />
          </div>
        </CardDetailsBlock>
        <PageFooter
          pageId={alertId}
          deleteButtonText={firstCheckProps.button}
          deleteButtonAction={openSecondCheck}
        />
      </OptionModal>
      <Alert
        isOpen={isOpenSecondCheck}
        setIsOpen={setOpenSecondCheck}
        dataTestId={alertId}
        headerText={secondCheckTitle}
        confirmButtonText={`${i18n.t("removependingalert.button.confirm")}`}
        cancelButtonText={`${i18n.t("removependingalert.button.cancel")}`}
        actionConfirm={handleConfirm}
        actionCancel={handleCloseSecondCheck}
        actionDismiss={handleCloseSecondCheck}
      />
      <VerifyPassword
        isOpen={verifyPasswordIsOpen}
        setIsOpen={setVerifyPasswordIsOpen}
        onVerify={deleteItem}
      />
      <VerifyPasscode
        isOpen={verifyPasscodeIsOpen}
        setIsOpen={setVerifyPasscodeIsOpen}
        onVerify={deleteItem}
      />
    </>
  );
};

export { RemovePendingAlert };
