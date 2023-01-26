import React from 'react';
import {useEffect} from 'react';
import {IonCol, IonGrid, IonPage, IonRow, IonButton} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';

const Crypto = (props) => {
  const pageName = 'My Wallets';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (props.location.pathname === '/tabs/crypto') {
      setSideMenu({
        options: sideMenuOptions,
        side: 'start',
        pageName: pageName,
      });
    }
  }, [props.location]);

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start">
        <IonGrid className="ion-margin">
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="primary"
                expand="block">
                Create New Wallet
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow className="ion-text-center">
            <IonCol>
              <IonButton
                shape="round"
                color="secondary"
                expand="block">
                Recover Existing Wallet
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Crypto;
