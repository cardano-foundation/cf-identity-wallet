import { IonModal } from "@ionic/react";
import { useMemo } from "react";
import { CredentialDetailModule } from "./CredentialDetailModule";
import {
  BackReason,
  CredentialDetailModalProps,
} from "./CredentialDetailModule.types";
import { BackEventPriorityType } from "../../globals/types";

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

  const hardwareBackButtonConfig = useMemo(
    () => ({
      prevent: false,
      priority: BackEventPriorityType.Modal,
    }),
    []
  );

  return (
    <IonModal
      data-testid={`${props.pageId}-modal`}
      isOpen={isOpen}
      onIonModalDidDismiss={handleClose}
    >
      <CredentialDetailModule
        {...props}
        onClose={handleBack}
        hardwareBackButtonConfig={hardwareBackButtonConfig}
      />
    </IonModal>
  );
};

export { CredentialDetailModal };
