import { IonAlert } from "@ionic/react";
import { AlertProps } from "./Alert.types";

const Alert = ({
  isOpen,
  setIsOpen,
  headerText,
  confirmButtonText,
  cancelButtonText,
  actionConfirm,
}: AlertProps) => {
  return (
    <div
      data-testid="alert-wrapper"
      className={isOpen ? "alert-visible" : "alert-invisible"}
    >
      <IonAlert
        isOpen={isOpen}
        header={headerText}
        buttons={[
          {
            text: confirmButtonText,
            role: "confirm",
            handler: () => {
              setIsOpen(false);
              actionConfirm();
            },
          },
          {
            text: cancelButtonText,
            role: "cancel",
            handler: () => {
              setIsOpen(false);
            },
          },
        ]}
        onDidDismiss={() => setIsOpen(false)}
      />
    </div>
  );
};

export default Alert;
