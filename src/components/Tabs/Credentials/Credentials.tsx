import React from 'react';
import {useEffect} from 'react';
import {
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonThumbnail,
  IonLabel,
} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import './Credentials.css';

const Credentials = (props: {location?: any; sideMenuOptions?: any}) => {
  const pageName = 'My Credentials';
  const {sideMenuOptions, location} = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (location.pathname === '/tabs/credentials') {
      setSideMenu({
        options: sideMenuOptions,
        side: 'start',
        pageName: pageName,
      });
    }
  }, [location]);

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start">
        <IonGrid>
          <IonRow className="ion-margin">
            <IonCol className="ion-align-self-start">
              <IonCard>
                <IonGrid fixed={true}>
                  <IonRow>
                    <IonCol size="auto">
                      <div style={{width: '90px'}}>
                        <IonThumbnail>
                          <img src="assets/logoicon.png" />
                        </IonThumbnail>
                      </div>
                    </IonCol>
                    <IonCol>
                      <IonLabel>
                        <h1><strong>Student Card</strong></h1>
                        <p>University of Zurich</p>
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>
              <IonCard>
                <IonGrid fixed={true}>
                  <IonRow>
                    <IonCol size="auto">
                      <div style={{width: '90px'}}>
                        <IonThumbnail>
                          <img src="assets/logoicon.png" />
                        </IonThumbnail>
                      </div>
                    </IonCol>
                    <IonCol>
                      <IonLabel>
                      <h1><strong>Employee ID</strong></h1>
                        <p>Cardano Foundation</p>
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>
              <IonCard>
                <IonGrid fixed={true}>
                  <IonRow>
                    <IonCol size="auto">
                      <div style={{width: '90px'}}>
                        <IonThumbnail>
                          <img src="assets/logoicon.png" />
                        </IonThumbnail>
                      </div>
                    </IonCol>
                    <IonCol>
                      <IonLabel>
                      <h1><strong>CBCA Certificate</strong></h1>
                        <p>Cardano Academy</p>
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>
              <IonCard>
                <IonGrid fixed={true}>
                  <IonRow>
                    <IonCol size="auto">
                      <div style={{width: '90px'}}>
                        <IonThumbnail>
                          <img src="assets/logoicon.png" />
                        </IonThumbnail>
                      </div>
                    </IonCol>
                    <IonCol>
                      <IonLabel>
                      <h1><strong>Proof Of Origin</strong></h1>
                        <p>Baia's Wine</p>
                      </IonLabel>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Credentials;
