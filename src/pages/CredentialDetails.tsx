import React from 'react';
import {IonButton, IonPage} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {useLocation} from "react-router-dom";

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
                    CRED DETAILS
                </div>
            </CustomPage>
        </IonPage>
  );
};

export default CredentialDetails;
