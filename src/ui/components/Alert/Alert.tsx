import { AlertButton, IonAlert } from "@ionic/react";
import { AlertProps } from "./Alert.types";
import "./Alert.scss";

const Alert = ({
  isOpen,
  setIsOpen,
  headerText,
  confirmButtonText,
  cancelButtonText,
  actionConfirm,
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

  return (
    <div
      data-testid="alert-wrapper"
      className={isOpen ? "alert-visible" : "alert-invisible"}
    >
      <IonAlert
        isOpen={isOpen}
        header={headerText}
        buttons={buttons}
        onDidDismiss={() => setIsOpen(false)}
      />
    </div>
  );
};

export default Alert;
