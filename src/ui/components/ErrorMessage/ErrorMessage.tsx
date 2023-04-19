import { useEffect, useState } from "react";
import { IonLabel } from "@ionic/react";
import "./ErrorMessage.scss";
const ErrorMessage = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000);

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

export { ErrorMessage };
