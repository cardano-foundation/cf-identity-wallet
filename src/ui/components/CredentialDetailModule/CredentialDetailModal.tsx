import { IonModal } from "@ionic/react";
import { CredentialDetailModule } from "./CredentialDetailModule";
import {
  BackReason,
  CredentialDetailModalProps,
} from "./CredentialDetailModule.types";

const CredentialDetailModal = ({
  isOpen,
  setIsOpen,
  onClose,
  ...props
}: CredentialDetailModalProps) => {
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBack = (reason: BackReason) => {
    handleClose();
    onClose?.(reason);
  };

  return (
    <IonModal
      data-testid={`${props.pageId}-modal`}
      isOpen={isOpen}
      onIonModalDidDismiss={handleClose}
    >
      <CredentialDetailModule
        {...props}
        onClose={handleBack}
      />
    </IonModal>
  );
};

export { CredentialDetailModal };
