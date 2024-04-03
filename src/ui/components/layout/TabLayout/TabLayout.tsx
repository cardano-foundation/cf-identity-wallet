import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewDidLeave,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import "./TabLayout.scss";
import { useState } from "react";
import { TabLayoutProps } from "./TabLayout.types";

const TabLayout = ({
  pageId,
  customClass,
  header,
  avatar,
  backButton,
  backButtonAction,
  title,
  doneLabel,
  doneAction,
  additionalButtons,
  actionButton,
  actionButtonAction,
  actionButtonLabel,
  children,
  placeholder,
}: TabLayoutProps) => {
  const [isActive, setIsActive] = useState(false);
  useIonViewDidEnter(() => {
    setIsActive(true);
  });

  useIonViewDidLeave(() => {
    setIsActive(false);
  });
  return (
    <IonPage
      className={`tab-layout ${pageId} ${!isActive ? " " + "ion-hide" : ""} ${
        customClass ? " " + customClass : ""
      }`}
      data-testid={pageId}
    >
      {header && (
        <IonHeader className="ion-no-border tab-header">
          <IonToolbar
            color="transparent"
            className={`${backButton ? "has-back-button" : ""}`}
          >
            {avatar && <IonButtons slot="start">{avatar}</IonButtons>}

            {backButton && backButtonAction && (
              <IonButtons
                slot="start"
                className="back-button"
                data-testid="tab-back-button"
                onClick={backButtonAction}
              >
                <IonIcon
                  icon={arrowBackOutline}
                  color="primary"
                />
              </IonButtons>
            )}

            {doneLabel && doneAction && (
              <IonTitle
                onClick={doneAction}
                data-testid="tab-done-button"
              >
                <h4>{doneLabel}</h4>
              </IonTitle>
            )}

            {title && (
              <IonTitle data-testid={`tab-title-${title.toLowerCase()}`}>
                <h2>{title}</h2>
              </IonTitle>
            )}

            <IonButtons slot="end">
              {additionalButtons}

              {actionButton && actionButtonLabel && (
                <IonButton
                  className="action-button-label"
                  onClick={actionButtonAction}
                  data-testid="action-button"
                >
                  {actionButtonLabel}
                </IonButton>
              )}
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      )}
      {placeholder || (
        <IonContent
          className="tab-content"
          color="transparent"
        >
          {children}
        </IonContent>
      )}
    </IonPage>
  );
};

export { TabLayout };
