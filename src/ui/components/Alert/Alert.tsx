import { AlertButton, IonAlert } from "@ionic/react";
import { AlertProps } from "./Alert.types";
import "./Alert.scss";

const Alert = ({
  isOpen,
  setIsOpen,
  headerText,
  subheaderText,
  confirmButtonText,
  cancelButtonText,
  actionConfirm,
  actionDismiss,
}: AlertProps) => {
  const buttons: AlertButton[] = [];

  if (confirmButtonText && actionConfirm) {
    buttons.push({
      text: confirmButtonText,
      role: "confirm",
      handler: () => {
        setIsOpen(false);
        actionConfirm && actionConfirm();
      },
    });
  }

  if (cancelButtonText) {
    buttons.push({
      text: cancelButtonText,
      role: "cancel",
      handler: () => {
        setIsOpen(false);
      },
    });
  }

  const handleDismiss = () => {
    if (actionDismiss) {
      actionDismiss;
    }
    setIsOpen(false);
  };

  return (
    <div
      data-testid="alert-wrapper"
      className={isOpen ? "alert-visible" : "alert-invisible"}
    >
      <IonAlert
        isOpen={isOpen}
        header={headerText}
        subHeader={subheaderText}
        buttons={buttons}
        onDidDismiss={handleDismiss}
      />
    </div>
  );
};

export { Alert };
