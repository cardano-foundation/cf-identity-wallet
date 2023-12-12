import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackOutline, menuOutline } from "ionicons/icons";
import "./TabLayout.scss";
import { TabLayoutProps } from "./TabLayout.types";

const TabLayout = ({
  header,
  avatar,
  backButton,
  backButtonAction,
  title,
  titleSize,
  titleAction,
  menuButton,
  additionalButtons,
  actionButton,
  actionButtonAction,
  actionButtonLabel,
  children,
}: TabLayoutProps) => {
  return (
    <>
      {header && (
        <IonHeader className="ion-no-border tab-header">
          <IonToolbar color="transparent">
            {avatar && <IonButtons slot="start">{avatar}</IonButtons>}

            {backButton && backButtonAction && (
              <IonButtons
                slot="start"
                className="back-button"
                data-testid="back-button"
                onClick={backButtonAction}
              >
                <IonIcon
                  icon={arrowBackOutline}
                  color="primary"
                />
              </IonButtons>
            )}

            {title && (
              <IonTitle
                onClick={titleAction}
                data-testid={`tab-title-${title.toLowerCase()}`}
              >
                {(titleSize === "h2" || !titleSize) && <h2>{title}</h2>}
                {titleSize === "h3" && <h3>{title}</h3>}
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
        className="tab-content"
        color="transparent"
      >
        {children}
      </IonContent>
    </>
  );
};

export { TabLayout };
