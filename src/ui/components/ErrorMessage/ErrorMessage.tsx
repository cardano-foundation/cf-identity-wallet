import { useEffect, useState } from "react";
import "./ErrorMessage.scss";
import { ErrorMessageProps } from "./ErrorMessage.types";

const MESSAGE_MILLISECONDS = 250000;

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
    <>
      {message ? (
        <div
          data-testid="error-message"
          className={`error-message ${visible ? "visible" : ""}`}
        >
          <p
            className="text-fadein"
            data-testid="error-message-text"
          >
            {message}
          </p>
        </div>
      ) : (
        <div className="error-message-placeholder" />
      )}
    </>
  );
};

export { MESSAGE_MILLISECONDS, ErrorMessage };
