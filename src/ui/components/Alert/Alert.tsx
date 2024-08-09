import { AlertButton, IonAlert } from "@ionic/react";
import { BackEventPriorityType } from "../../globals/types";
import { useIonHardwareBackButton } from "../../hooks";
import { combineClassNames } from "../../utils/style";
import "./Alert.scss";
import { AlertProps } from "./Alert.types";

const Alert = ({
  isOpen,
  backdropDismiss = true,
  setIsOpen,
  dataTestId,
  headerText,
  subheaderText,
  confirmButtonText,
  secondaryConfirmButtonText,
  cancelButtonText,
  className,
  actionConfirm,
  actionSecondaryConfirm,
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

  if (secondaryConfirmButtonText && actionSecondaryConfirm) {
    buttons.push({
      id: "secondary-confirm-alert-button",
      text: secondaryConfirmButtonText,
      role: "confirm",
      htmlAttributes: {
        "data-testid": `${dataTestId}-secondary-confirm-button`,
      },
      handler: () => {
        setIsOpen(false);
        actionSecondaryConfirm && actionSecondaryConfirm();
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

  useIonHardwareBackButton(
    BackEventPriorityType.Alert,
    () => {
      if (!backdropDismiss && !cancelButtonText) return;
      handleDismiss();
    },
    !isOpen
  );

  const alerClasses = combineClassNames(className, "custom-alert");

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
        cssClass={alerClasses}
        header={headerText}
        subHeader={subheaderText}
        buttons={buttons}
        onDidDismiss={({ detail }) =>
          detail.role === "backdrop" && handleDismiss()
        }
      />
    </div>
  );
};

export { Alert };
