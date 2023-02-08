import React from 'react';
import {IonButton, IonCard, IonCol, IonGrid, IonLabel, IonPage, IonRow, IonThumbnail} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {useLocation} from "react-router-dom";
import {isDarkMode} from "../theme/handleTheme";

const CredentialDetails = (props) => {

    const location = useLocation();
    const cred = location.state?.currentCred || '';
    
    return (
        <IonPage id={cred.name}>
            <CustomPage
                name={cred.name}
                sideMenu={false}
                sideMenuPosition="start"
                backButton={true}
                backButtonText="Back"
                backButtonPath={'/tabs/creds'}
                actionButton={false}
                actionButtonIcon={addOutline}
                actionButtonIconSize="1.7rem">
                <div className=''>
                <IonCard
                  key={cred.id}>
                  <IonGrid fixed={true}>
                    <IonRow>
                      <IonCol size="auto">
                        <IonThumbnail className="w-24 py-3">
                          <img src={cred.name} />
                        </IonThumbnail>
                      </IonCol>
                      <IonCol>
                        <IonLabel className="py-3">
                          <h1>
                            <strong>{cred.type}</strong>
                          </h1>
                          <p>{cred.entity}</p>
                        </IonLabel>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="auto">
                        Details ....
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCard>
                </div>
            </CustomPage>
        </IonPage>
  );
};

export default CredentialDetails;
