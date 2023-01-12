import React from 'react';
import {
  IonButtons,
  IonCard,
  IonCardHeader,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonButton,
} from '@ionic/react';

const All = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>All</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">All</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Sample usage</IonCardSubtitle>
            <IonCardTitle>Overlay Hooks</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonButton>Default</IonButton>
            <IonButton disabled={true}>Disabled</IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default All;
