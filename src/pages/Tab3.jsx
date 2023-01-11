import React from 'react';
import { useEffect } from 'react';
import { useSideMenuUpdate } from '../main/SideMenuProvider';

import './Tab3.css';
import CustomPage from '../main/CustomPage';

import { PageHeader } from '../components/PageHeader';
import { IonPage, IonGrid } from '@ionic/react';

const Tab3 = (props) => {
  const pageName = 'Places';
  const { sideMenuOptions } = props;
  const setSideMenu = useSideMenuUpdate();

  useEffect(() => {
    if (props.location.pathname === '/tabs/tab3') {
      setSideMenu({
        options: sideMenuOptions,
        side: 'start',
        pageName: pageName,
      });
    }
  }, [props.location]);

  return (
    <IonPage id={pageName}>
      <CustomPage name={pageName} sideMenu={true} sideMenuPosition='start'>
        <IonGrid>
          <PageHeader count={sideMenuOptions.length} pageName={pageName} />
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Tab3;
