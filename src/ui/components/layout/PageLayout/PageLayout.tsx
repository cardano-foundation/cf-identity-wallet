import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonProgressBar,
  IonButton,
  IonIcon,
  IonTitle,
} from "@ionic/react";
import { arrowBackOutline, closeOutline } from "ionicons/icons";
import "./PageLayout.scss";
import { PageLayoutProps } from "./PageLayout.types";

const PageLayout = ({
  backButton,
  backButtonPath,
  children,
  closeButton,
  closeButtonAction,
  progressBar,
  progressBarValue,
  progressBarBuffer,
  title,
}: PageLayoutProps) => {
  const mainContent = children;

  return (
    <>
      <IonHeader
        translucent={true}
        className="ion-no-border"
      >
        <IonToolbar color="light">
          <IonButtons slot="start">
            {backButton && (
              <IonBackButton
                icon={arrowBackOutline}
                text=""
                defaultHref={backButtonPath}
                color="primary"
              />
            )}
            {closeButton && (
              <IonButton
                shape="round"
                className="close-button"
                onClick={closeButtonAction}
              >
                <IonIcon
                  slot="icon-only"
                  icon={closeOutline}
                  color="primary"
                ></IonIcon>
              </IonButton>
            )}
          </IonButtons>

          {title && (
            <IonTitle>
              <h2>{title}</h2>
            </IonTitle>
          )}
          {progressBar && (
            <div className="progress-bar-container">
              <IonProgressBar
                value={progressBarValue}
                buffer={progressBarBuffer}
              />
            </div>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent color="light">{mainContent}</IonContent>
    </>
  );
};

export { PageLayout };
