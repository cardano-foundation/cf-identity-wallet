import React from 'react';
import {IonCol, IonGrid, IonPage, IonProgressBar, IonRow} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';

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
        <IonGrid>
          <IonProgressBar
            value={0.25}
            buffer={1}></IonProgressBar>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <p>
                <strong>
                  The password unlocks the wallet in this device...
                </strong>
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default CreateWallet;
