import React from 'react';
import { IonRow, IonCol, IonCardSubtitle, IonCardTitle } from '@ionic/react';

export const PageHeader = (props) => (
  <IonRow className='ion-text-center ion-margin-top'>
    <IonCol size='12'>
      <IonCardTitle>Tab Menu with Side Menu</IonCardTitle>
      <IonCardSubtitle className='ion-margin-top'>
        {props.pageName} page with {props.count} side menu options
      </IonCardSubtitle>
    </IonCol>
  </IonRow>
);
