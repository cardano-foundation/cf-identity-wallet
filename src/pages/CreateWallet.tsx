import React from 'react';
import {
  IonButton,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonToggle,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import './CreateWallet.css';

const CreateWallet = (props) => {
  const pageName = 'Create Wallet';

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/tabs/crypto'}
        actionButton={false}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem">
        <IonProgressBar
          value={0.25}
          buffer={1}
        />
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonItem>
                <IonLabel>
                  <h4>The password unlocks the wallet in this device...</h4>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonItem>
                <IonLabel position="stacked">
                  <strong>Enter Wallet/Account Name</strong>
                </IonLabel>
                <IonInput placeholder="Enter text" />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">
                  <strong>Set Spending Password</strong>
                </IonLabel>
                <IonInput placeholder="Enter text" />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">
                  <strong>Confirm Spending Password</strong>
                </IonLabel>
                <IonInput placeholder="Enter text" />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonLabel>
                  <h3>Unlock with Face ID</h3>
                </IonLabel>
                <IonToggle slot="end" />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                <IonCheckbox slot="start" />
                <IonLabel className="terms_and_conditions">
                  I understand that if I lose my recovery phrase, I will not be
                  able to access my account <a href="#">Terms</a>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="dark"
                expand="block"
                href="/recoveryseedphrase">
                Continue
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="light"
                expand="block"
                href="/tabs/crypto">
                Cancel
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default CreateWallet;
