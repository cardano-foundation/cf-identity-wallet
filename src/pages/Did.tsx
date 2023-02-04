import React, {useEffect} from 'react';
import {IonCol, IonGrid, IonItem, IonLabel, IonPage, IonRow,} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {useLocation} from "react-router-dom";

const Did = (props) => {

  const location = useLocation();
  const pageName = location.state?.name;

  useEffect(() => {
  }, []);
  return (
      <IonPage id={pageName}>
        <CustomPage
            name={pageName}
            sideMenu={false}
            sideMenuPosition="start"
            backButton={true}
            backButtonText="Back"
            backButtonPath={'/dids'}
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
                    <h4>dids goes here...</h4>
                  </IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </CustomPage>
      </IonPage>
  );
};

export default Did;
