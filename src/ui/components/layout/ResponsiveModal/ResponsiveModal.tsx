import { IonModal } from "@ionic/react";
import "./ResponsiveModal.scss";
import { ResponsiveModalProps } from "./ResponsiveModal.types";

const ResponsiveModal = ({
  componentId,
  modalIsOpen,
  customClasses,
  children,
  onDismiss,
}: ResponsiveModalProps) => {
  return (
    <IonModal
      isOpen={modalIsOpen}
      breakpoints={[0, 1]}
      initialBreakpoint={1}
      data-testid={componentId}
      className={`responsive-modal ${customClasses}`}
      onDidDismiss={onDismiss}
    >
      <div className={`responsive-modal-content ${componentId}-content`}>
        {children}
      </div>
    </IonModal>
  );
};

export { ResponsiveModal };
