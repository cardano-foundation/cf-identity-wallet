import React from 'react';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';

const RecoverySeedPhrase = (props) => {
  const pageName = 'Recovery Seed Phrase';

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/createwallet'}
        actionButton={false}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem">
        <IonProgressBar
          value={0.5}
          buffer={1}
        />
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonItem>
                <IonLabel>
                  <h4>Write down this Secret Recovery Phrase</h4>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default RecoverySeedPhrase;
