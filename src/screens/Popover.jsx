import React from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonListHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  useIonPopover,
  IonButton,
} from '@ionic/react';

const Popover = () => {
  const PopoverList = ({ onHide }) => (
    <IonList>
      <IonListHeader>Ionic</IonListHeader>
      <IonItem button>Learn Ionic</IonItem>
      <IonItem button>Documentation</IonItem>
      <IonItem button>Showcase</IonItem>
      <IonItem button>GitHub Repo</IonItem>
      <IonItem lines="none" detail={false} button onClick={onHide}>
        Close
      </IonItem>
    </IonList>
  );

  const [present, dismiss] = useIonPopover(PopoverList, {
    onHide: () => dismiss(),
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Popover</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Popover</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonButton
          expand="block"
          onClick={(e) =>
            present({
              event: e.nativeEvent,
            })
          }
        >
          Show Popover
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Popover;
