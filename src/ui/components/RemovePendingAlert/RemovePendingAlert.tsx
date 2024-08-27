import { useState } from "react";
import { alertCircleOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { Alert } from "../Alert";
import { OptionModal } from "../OptionsModal";
import { RemovePendingAlertProps } from "./RemovePendingAlert.types";
import { i18n } from "../../../i18n";
import { PageFooter } from "../PageFooter";
import "./RemovePendingAlert.scss";
import { CardDetailsBlock } from "../CardDetails";
import { Verification } from "../Verification";

const RemovePendingAlert = ({
  pageId,
  openFirstCheck,
  secondCheckTitle,
  onClose,
  firstCheckProps,
  onDeletePendingItem,
}: RemovePendingAlertProps) => {
  const alertId = `${pageId}-delete-pending-modal`;
  const [isOpenSecondCheck, setOpenSecondCheck] = useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);

  const handleConfirm = () => {
    handleCloseSecondCheck();
    setVerifyIsOpen(true);
  };

  const handleCloseSecondCheck = () => {
    setOpenSecondCheck(false);
  };

  const deleteItem = () => {
    setVerifyIsOpen(false);
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
      <Verification
        verifyIsOpen={verifyIsOpen}
        setVerifyIsOpen={setVerifyIsOpen}
        onVerify={deleteItem}
      />
    </>
  );
};

export { RemovePendingAlert };
