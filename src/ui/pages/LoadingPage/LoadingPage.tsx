import { IonSpinner } from "@ionic/react";
import "./LoadingPage.scss";

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <IonSpinner name="crescent" />
    </div>
  );
};

export { LoadingPage };
