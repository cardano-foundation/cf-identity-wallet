import React from 'react';
import { IonCol, IonGrid, IonPage, IonRow } from '@ionic/react';
import { addOutline } from 'ionicons/icons';

import './Tab1.css';
import CustomPage from '../main/CustomPage';

const Payments = (props) => {
  const pageName = 'Payments';

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition='start'
        backButton={true}
        backButtonText='Home'
        actionButton={true}
        actionButtonIcon={addOutline}
        actionButtonPosition='end'
        actionButtonIconSize='1.7rem'
      >
        <IonGrid>
          <IonRow className='ion-text-center'>
            <IonCol size='12'>
              <h3>Sub page</h3>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Payments;
