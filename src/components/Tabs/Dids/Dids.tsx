import React from 'react';
import {useEffect} from 'react';
import {IonCol, IonGrid, IonPage, IonRow} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';

const Dids = (props) => {
  const pageName = 'My Identity';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (props.location.pathname === '/tabs/dids') {
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
        <IonGrid>
          <IonRow className="ion-margin">
            <IonCol className="ion-align-self-center ion-margin"></IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Dids;
