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
  IonSearchbar,
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
    searchbar = false,
    searchbarEvent,
    showLargeHeader = true,
  } = props;

  return (
    <>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>{name}</IonTitle>

          {backButton && (
            <IonButtons slot="start">
              <IonBackButton
                icon={backButtonIcon}
                text={backButtonText}
                defaultHref={backButtonPath}
              />
            </IonButtons>
          )}

          {actionButton && actionButtonIcon && (
            <IonButtons slot={actionButtonPosition}>
              <IonIcon
                style={{fontSize: actionButtonIconSize}}
                icon={actionButtonIcon}
                onClick={actionButtonClickEvent}></IonIcon>
            </IonButtons>
          )}

          {sideMenu && (
            <IonButtons slot={sideMenuPosition}>
              <IonMenuButton />
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent
        className={contentClass}
        fullscreen>
        {showLargeHeader && (
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle
                slot="start"
                size="large">
                {name}
              </IonTitle>
              {searchbar && (
                <IonSearchbar
                  style={{marginTop: '-0.2rem', width: '50%', float: 'right'}}
                  onKeyUp={(e) => searchbarEvent(e)}
                  onChange={(e) => searchbarEvent(e)}
                />
              )}
            </IonToolbar>
          </IonHeader>
        )}
        {mainContent}
      </IonContent>
    </>
  );
};

export default CustomPage;
