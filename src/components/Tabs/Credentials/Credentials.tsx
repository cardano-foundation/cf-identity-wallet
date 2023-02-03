import React from 'react';
import {
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
  IonCard,
  IonThumbnail,
  IonLabel,
} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import './Credentials.css';
import CREDENTIALS_RESPONSE from '../../../api/mock/credentials.json';

const Credentials = (props) => {
  const pageName = 'My Credentials';
  const creds = CREDENTIALS_RESPONSE.data;
  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start">
        <IonGrid>
          <IonRow className="ion-margin">
            <IonCol className="ion-align-self-start">
              {creds.map((cred, index) => (
                <IonCard 
                  key={index}>
                  <IonGrid fixed={true}>
                    <IonRow>
                      <IonCol size="auto">
                        <IonThumbnail className="w-24 py-3">
                          <img src={cred.imageUrl} />
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
                  </IonGrid>
                </IonCard>
              ))}
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Credentials;
