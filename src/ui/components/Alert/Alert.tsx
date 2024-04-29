import { AlertButton, IonAlert } from "@ionic/react";
import { AlertProps } from "./Alert.types";
import "./Alert.scss";

const Alert = ({
  isOpen,
  backdropDismiss = true,
  setIsOpen,
  dataTestId,
  headerText,
  subheaderText,
  confirmButtonText,
  cancelButtonText,
  actionConfirm,
  actionCancel,
  actionDismiss,
}: AlertProps) => {
  const buttons: AlertButton[] = [];

  if (confirmButtonText && actionConfirm) {
    buttons.push({
      id: "confirm-alert-button",
      text: confirmButtonText,
      role: "confirm",
      htmlAttributes: {
        "data-testid": `${dataTestId}-confirm-button`,
      },
      handler: () => {
        setIsOpen(false);
        actionConfirm && actionConfirm();
      },
    });
  }

  if (cancelButtonText) {
    buttons.push({
      id: "cancel-alert-button",
      text: cancelButtonText,
      role: "cancel",
      htmlAttributes: {
        "data-testid": `${dataTestId}-cancel-button`,
      },
      handler: () => {
        setIsOpen(false);
        actionCancel && actionCancel();
      },
    });
  }

  const handleDismiss = () => {
    if (actionDismiss) {
      actionDismiss();
    }
    setIsOpen(false);
  };

  return (
    <div
      data-testid={dataTestId + "-container"}
      className={`custom-alert-container ${
        isOpen ? "alert-visible" : "alert-invisible"
      }`}
    >
      <IonAlert
        data-testid={dataTestId}
        isOpen={isOpen}
        backdropDismiss={backdropDismiss}
        cssClass="custom-alert"
        header={headerText}
        subHeader={subheaderText}
        buttons={buttons}
        onDidDismiss={({ detail }) =>
          detail.role === "backdrop" && handleDismiss
        }
      />
    </div>
  );
};

export { Alert };
