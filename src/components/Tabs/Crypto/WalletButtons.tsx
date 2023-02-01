import {IonButton, IonCol, IonGrid, IonRow} from '@ionic/react';
import React from 'react';

export default function WalletButtons() {
  return (
    <IonGrid className="ion-margin buttons_grid">
      <IonRow className="ion-text-center">
        <IonCol>
          <IonButton
            shape="round"
            color="dark"
            expand="block"
            href="/createwallet"
            className="h-auto my-4">
            Create New Wallet
          </IonButton>
          <IonButton
            shape="round"
            color="light"
            expand="block"
            className="h-auto my-4">
            Recover Existing Wallet
          </IonButton>
        </IonCol>
      </IonRow>
    </IonGrid>
  );
}
