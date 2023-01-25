import React from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';

const Toast = () => {
  const [present, dismiss] = useIonToast();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Toast</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Toast</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonButton
          expand="block"
          onClick={() =>
            present({
              buttons: [{text: 'hide', handler: () => dismiss()}],
              message: 'toast from hook, click hide to dismiss',
              onDidDismiss: () => console.log('dismissed'),
              onWillDismiss: () => console.log('will dismiss'),
            })
          }>
          Show Toast
        </IonButton>
        <IonButton
          expand="block"
          onClick={() => present('hello from hook', 3000)}>
          Show Toast using params, closes in 3 secs
        </IonButton>
        <IonButton
          expand="block"
          onClick={dismiss}>
          Hide Toast
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Toast;
