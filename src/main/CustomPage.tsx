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

const CustomPage = (props) => {
  const mainContent = props.children;
  const {
    name,
    sideMenu = false,
    sideMenuPosition = 'end',
    backButton = false,
    backButtonIcon = chevronBack,
    backButtonText = ' ',
    backButtonPath,
    actionButton = false,
    actionButtonPosition,
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
            <IonRow className="">
              <IonCol className="">
                {sideMenu && (
                  <IonButtons slot={sideMenuPosition}>
                    <IonMenuButton />
                  </IonButtons>
                )}
                {backButton && (
                  <IonButtons slot="start">
                    <IonBackButton
                      icon={backButtonIcon}
                      text={backButtonText}
                      defaultHref={backButtonPath}
                    />
                  </IonButtons>
                )}
              </IonCol>
              <IonCol className="ion-align-self-center">
                <IonTitle className="ion-no-padding">{name}</IonTitle>
              </IonCol>
              <IonCol className="">
                {actionButton && actionButtonIcon && (
                  <IonButtons slot={actionButtonPosition}>
                    <IonIcon
                      style={{fontSize: actionButtonIconSize}}
                      icon={actionButtonIcon}
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

export default CustomPage;
