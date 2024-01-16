import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackOutline, menuOutline } from "ionicons/icons";
import "./TabLayout.scss";
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
  menuButton,
  additionalButtons,
  actionButton,
  actionButtonAction,
  actionButtonLabel,
  children,
  placeholder,
}: TabLayoutProps) => {
  return (
    <IonPage
      className={`tab-layout ${pageId} ${customClass ? " " + customClass : ""}`}
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
                <h3>{doneLabel}</h3>
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

              {menuButton && (
                <IonButton
                  shape="round"
                  className="menu-button"
                  data-testid={`menu-button-${title?.toLowerCase()}`}
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
