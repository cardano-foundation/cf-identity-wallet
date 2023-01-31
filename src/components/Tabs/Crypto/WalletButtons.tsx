import {IonButton, IonCol, IonGrid, IonRow} from '@ionic/react';
import React from 'react';

export default function WalletButtons() {
  return (
    <IonGrid className="ion-margin buttons_grid">
      <IonRow className="ion-text-center">
        <IonCol>
          <IonButton
            shape="round"
            color="primary"
            expand="block"
            href="/createwallet">
            Create New Wallet
          </IonButton>
        </IonCol>
      </IonRow>
      <IonRow className="ion-text-center">
        <IonCol>
          <IonButton
            shape="round"
            color="secondary"
            expand="block">
            Recover Existing Wallet
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
