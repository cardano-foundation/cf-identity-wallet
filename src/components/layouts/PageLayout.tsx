import React from 'react';
import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonBackButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {chevronBack} from 'ionicons/icons';
import './PageLayout.css';

const Pagelayout = (props) => {
  const mainContent = props.children;
  const {
    name,
    sideMenu = false,
    backButton = false,
    backButtonIcon = chevronBack,
    backButtonText = ' ',
    backButtonPath,
    actionButton = false,
    actionButtonIcon,
    actionButtonIconSize,
    actionButtonClickEvent,
    contentClass,
  } = props;

  return (
    <>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonGrid>
            <IonRow>
              <IonCol className="column_left">
                {sideMenu && (
                  <IonButtons>
                    <IonMenuButton />
                  </IonButtons>
                )}
                {backButton && (
                  <IonButtons>
                    <IonBackButton
                      icon={backButtonIcon}
                      text={backButtonText}
                      defaultHref={backButtonPath}
                    />
                  </IonButtons>
                )}
              </IonCol>
              <IonCol className="column_center">
                <IonTitle className="ion-no-padding">{name}</IonTitle>
              </IonCol>
              <IonCol className="column_right">
                {actionButton && actionButtonIcon && (
                  <IonButtons>
                    <IonIcon
                      style={{fontSize: actionButtonIconSize}}
                      icon={actionButtonIcon}
                      className="ion-no-padding"
                      onClick={actionButtonClickEvent}></IonIcon>
                  </IonButtons>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className={contentClass}
        fullscreen>
        {mainContent}
      </IonContent>
    </>
  );
};

export default Pagelayout;
