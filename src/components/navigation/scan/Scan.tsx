import React, {useEffect} from 'react';
import {IonCol, IonGrid, IonPage, IonRow} from '@ionic/react';
import CustomPage from '../../shared/CustomPage';
import {useSideMenuUpdate} from '../../shared/SideMenuProvider';

const Scan = (props: any) => {
  const pageName = 'Scan';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (props.location.pathname === '/tabs/scan') {
      setSideMenu({
        options: sideMenuOptions,
        pageName: pageName,
      });
    }
  }, [props.location]);

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={true}>
        <IonGrid>
          <IonRow className="ion-margin">
            <IonCol className="ion-align-self-center ion-margin"></IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Scan;
