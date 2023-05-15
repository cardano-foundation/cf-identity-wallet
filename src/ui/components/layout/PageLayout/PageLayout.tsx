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
  IonFooter,
} from "@ionic/react";
import { arrowBackOutline, closeOutline, menuOutline } from "ionicons/icons";
import "./PageLayout.scss";
import { PageLayoutProps } from "./PageLayout.types";

const PageLayout = ({
  header,
  backButton,
  backButtonPath,
  children,
  closeButton,
  closeButtonAction,
  progressBar,
  progressBarValue,
  progressBarBuffer,
  title,
  menuButton,
  footer,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonDisabled,
}: PageLayoutProps) => {
  const mainContent = children;

  return (
    <>
      {header && (
        <IonHeader
          translucent={true}
          className="ion-no-border page-header"
        >
          <IonToolbar color="light">
            <IonButtons slot="start">
              {backButton && (
                <IonBackButton
                  icon={arrowBackOutline}
                  text=""
                  defaultHref={backButtonPath}
                  color="primary"
                  data-testid="back-button"
                />
              )}
              {closeButton && (
                <IonButton
                  shape="round"
                  className="close-button"
                  onClick={closeButtonAction}
                  data-testid="close-button"
                >
                  <IonIcon
                    slot="icon-only"
                    icon={closeOutline}
                    color="primary"
                  />
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

            <IonButtons slot="end">
              {menuButton && (
                <IonButton
                  shape="round"
                  className="menu-button"
                  data-testid="menu-button"
                >
                  <IonIcon
                    slot="icon-only"
                    icon={menuOutline}
                    color="primary"
                  />
                </IonButton>
              )}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent
        className="page-content"
        color="light"
      >
        {mainContent}
      </IonContent>

      {footer && (
        <IonFooter collapse="fade">
          <IonToolbar
            color="light"
            className="page-footer"
          >
            <IonButton
              shape="round"
              expand="block"
              className="ion-primary-button"
              data-testid="continue-button"
              onClick={primaryButtonAction}
              disabled={primaryButtonDisabled}
            >
              {primaryButtonText}
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </>
  );
};

export { PageLayout };
