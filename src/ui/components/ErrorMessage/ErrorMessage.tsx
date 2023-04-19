import { useEffect, useState } from "react";
import { IonLabel } from "@ionic/react";
import "./ErrorMessage.scss";

const MESSAGE_MILLISECONDS = 2000;

const ErrorMessage = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, MESSAGE_MILLISECONDS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      data-testid="error-messsage"
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
