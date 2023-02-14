import React from 'react';
import {
  IonCol,
  IonGrid,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../components/shared/CustomPage';

const FaceIdSetup = (props) => {
  const pageName = 'Face ID Setup';

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
        <IonGrid>
          <IonRow>
            <IonCol
              size="12"
              className="mt-5">
              <IonItem>
                <IonLabel>
                  <h4>Headline goes here...</h4>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default FaceIdSetup;
