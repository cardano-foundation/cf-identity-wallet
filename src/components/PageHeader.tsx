import React from 'react';
import {IonRow, IonCol, IonCardTitle} from '@ionic/react';

export const PageHeader = (props) => (
  <IonRow className="ion-text-left ion-margin">
    <IonCol size="12">
      <IonCardTitle>{props.pageName}</IonCardTitle>
    </IonCol>
  </IonRow>
);
