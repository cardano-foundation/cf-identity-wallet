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
  useIonActionSheet,
} from '@ionic/react';

const ActionSheet = () => {
  const [present, dismiss] = useIonActionSheet();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Action Sheet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Action Sheet</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonButton
          expand="block"
          onClick={() =>
            present({
              buttons: [{text: 'Ok'}, {text: 'Cancel'}],
              header: 'Action Sheet',
            })
          }>
          Show ActionSheet
        </IonButton>
        <IonButton
          expand="block"
          onClick={() =>
            present([{text: 'Ok'}, {text: 'Cancel'}], 'Action Sheet')
          }>
          Show ActionSheet using params
        </IonButton>
        <IonButton
          expand="block"
          onClick={() => {
            present([{text: 'Ok'}, {text: 'Cancel'}], 'Action Sheet');
            setTimeout(dismiss, 3000);
          }}>
          Show ActionSheet, hide after 3 seconds
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ActionSheet;
