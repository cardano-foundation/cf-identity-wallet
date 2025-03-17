import { IonSpinner } from "@ionic/react";
import "./LoadingPage.scss";
import { LoadingPageProps, LoadingType } from "./LoadingPage.types";
import splashImage from "../../assets/images/Splash.png";

const LoadingPage = ({ type = LoadingType.Spin }: LoadingPageProps) => {
  return (
    <div
      data-testid="loading-page"
      className="loading-page"
      style={
        type === LoadingType.Splash
          ? {
            background: `url(${splashImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
          : undefined
      }
    >
      {type === LoadingType.Spin && <IonSpinner name="crescent" />}
    </div>
  );
};

export { LoadingPage };
