import React from 'react';
import { useEffect, useState } from 'react';
import {
  IonCol,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import './Tab1.css';
import CustomPage from '../main/CustomPage';

import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { useSideMenuUpdate, useSideMenu } from '../main/SideMenuProvider';
import { tab1SideMenu } from '../main/PageSideMenus';

const Tab1 = (props) => {
  const pageName = 'Identity';
  const { sideMenuOptions } = props;
  const setSideMenu = useSideMenuUpdate();

  const [showModal, setShowModal] = useState(false);
  const [modalOptions, setModalOptions] = useState(false);

  const handleModal = async (index) => {
    await setModalOptions(tab1SideMenu[index]);
    setShowModal(true);
  };

  //	Access other side menu options here
  const sideMenu = useSideMenu();

  useEffect(() => {
    if (props.location.pathname === '/tabs/tab1') {
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
        <PageHeader count={sideMenuOptions.length} pageName={pageName} />

        <IonItem lines='none'>
          <IonLabel className='ion-text-wrap ion-padding'>
            <IonImg src='/assets/cardano-logo.png' />
          </IonLabel>
        </IonItem>
        <IonGrid>
          <IonRow className='ion-text-center'>
            <IonCol size='12'>
              <IonText color='primary'>
                <p>Work in progress...</p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>

        {showModal && modalOptions && (
          <Modal
            showModal={showModal}
            modalOptions={modalOptions}
            close={() => setShowModal(false)}
          />
        )}
      </CustomPage>
    </IonPage>
  );
};

export default Tab1;
