import { IonSpinner } from "@ionic/react";
import "./LoadingPage.scss";

const LoadingPage = () => {
  return (
    <div
      data-testid="loading-page"
      className="loading-page"
    >
      <IonSpinner name="crescent" />
    </div>
  );
};

export { LoadingPage };
