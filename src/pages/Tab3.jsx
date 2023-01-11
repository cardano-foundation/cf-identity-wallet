import React from 'react';
import { useEffect, useState } from 'react';
import {
  archiveOutline,
  checkmarkOutline,
  mailOutline,
  mailUnreadOutline,
  mapOutline,
  personOutline,
  refreshOutline,
  settingsSharp,
} from 'ionicons/icons';
import { useSideMenuUpdate, useSideMenu } from '../main/SideMenuProvider';

import './Tab3.css';
import CustomPage from '../main/CustomPage';

import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import {
  IonBadge,
  IonChip,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
} from '@ionic/react';
import { getInboxItems } from '../main/Utils';

const Tab3 = (props) => {
  const pageName = 'Settings';
  var { sideMenuOptions } = props;
  const setSideMenu = useSideMenuUpdate();

  const [Badge, setBadge] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalOptions, setModalOptions] = useState(false);

  const inboxItems = getInboxItems();

  const handleModal = async (index) => {
    await setModalOptions(sideMenuOptions[index]);
    setShowModal(true);
  };

  //  Access other side menu options here
  const sideMenu = useSideMenu();

  useEffect(() => {
    if (props.location.pathname === '/tabs/tab3') {
      setSideMenu({
        options: sideMenuOptions,
        side: 'start',
        pageName: pageName,
      });

      // sideMenuOptions = sideMenuOptions.filter(
      //   (m) => m.title === 'Timestamp style'
      // )[0].clickEvent = () => setBadge((Badge) => !Badge);
    }
  }, [props.location]);

  return (
    <IonPage id={pageName}>
      <CustomPage name={pageName} sideMenu={true} sideMenuPosition='start'>
        <IonGrid>
          <PageHeader count={sideMenuOptions.length} pageName={pageName} />

          <IonList>
            {inboxItems.map((item, index) => {
              return (
                <IonItem
                  routerLink={`/tabs/tab3/${item.id}`}
                  key={`item_${index}`}
                  detail={true}
                  lines='full'
                  detailIcon={
                    item.unread ? mailUnreadOutline : checkmarkOutline
                  }
                >
                  <IonLabel>
                    <h2>{item.sender}</h2>
                    <h4>{item.subject}</h4>
                    <p>{item.message}</p>
                  </IonLabel>
                  {Badge && (
                    <IonBadge slot='end' style={{ fontSize: '0.7rem' }}>
                      {item.time}
                    </IonBadge>
                  )}

                  {!Badge && (
                    <IonNote slot='end' style={{ fontSize: '0.9rem' }}>
                      {item.time}
                    </IonNote>
                  )}
                </IonItem>
              );
            })}
          </IonList>
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

export default Tab3;
