import React from 'react';
import {
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from '@ionic/react';
import CustomPage from '../layouts/PageLayout';
import {checkmarkCircleOutline, closeCircleOutline} from 'ionicons/icons';

const UpcomingFeatures = () => {
  const pageName = 'Upcoming Features';

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/'}
        actionButtonIconSize="1.7rem">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonList>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={checkmarkCircleOutline}
                    color="success"
                    className="mr-2"
                  />
                  P2P Chat
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  Crypto Transactions
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  Network Selection
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  DID methods
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  Credentials Sharing
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  DIDComm
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  QR Code Scan
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  Biometrics Integration
                </IonItem>
                <IonItem>
                  <IonIcon
                    size="small"
                    icon={closeCircleOutline}
                    color="danger"
                    className="mr-2"
                  />
                  Wallet Back-up
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default UpcomingFeatures;
