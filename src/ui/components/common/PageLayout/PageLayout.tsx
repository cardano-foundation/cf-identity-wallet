import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonPage,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import "./PageLayout.scss";
import { PageLayoutProps } from "./PageLayout.types";

export const PageLayout = ({
  backButton,
  backButtonPath,
  children,
  contentClasses,
  progressBar,
  progressBarValue,
  progressBarBuffer,
}: PageLayoutProps) => {
  const mainContent = children;

  return (
    <IonPage>
      <IonHeader
        translucent={true}
        collapse="fade"
        className="ion-no-border"
      >
        <IonToolbar>
          <IonGrid>
            <IonRow>
              <IonCol
                size="1"
                className="column-left"
              >
                {backButton && (
                  <IonButtons>
                    <IonBackButton
                      icon={arrowBackOutline}
                      text=""
                      defaultHref={backButtonPath}
                    />
                  </IonButtons>
                )}
              </IonCol>
              <IonCol
                size="11"
                className="column-right"
              >
                {progressBar && (
                  <IonProgressBar
                    value={progressBarValue}
                    buffer={progressBarBuffer}
                  />
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>

      <IonContent className={contentClasses}>{mainContent}</IonContent>
    </IonPage>
  );
};
