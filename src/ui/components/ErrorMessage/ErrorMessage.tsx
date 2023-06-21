import { useEffect, useState } from "react";
import { IonLabel } from "@ionic/react";
import "./ErrorMessage.scss";
import { ErrorMessageProps } from "./ErrorMessage.types";

const MESSAGE_MILLISECONDS = 2000;

const ErrorMessage = ({ message, timeout }: ErrorMessageProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, MESSAGE_MILLISECONDS);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div
      data-testid="error-message"
      className={`error-message ${visible ? "visible" : ""}`}
    >
      <IonLabel
        className="text-fadein"
        color="danger"
      >
        {message}
      </IonLabel>
    </div>
  );
};

export { MESSAGE_MILLISECONDS, ErrorMessage };
