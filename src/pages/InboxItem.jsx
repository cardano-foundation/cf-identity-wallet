import React from 'react';
import {useEffect, useState} from 'react';
import {personCircle} from 'ionicons/icons';

import './Tab2.css';
import CustomPage from '../main/CustomPage';

import {
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  useIonViewWillEnter,
} from '@ionic/react';
import {useParams} from 'react-router';
import {getInboxItemByID} from '../main/Utils';

import './InboxItem.css';

const InboxItem = (props) => {
  const pageName = 'Inbox';
  const params = useParams();

  const [inboxItem, setInboxItem] = useState({});

  useIonViewWillEnter(() => {
    const inboxItemID = params.id;
    const tempInboxItem = getInboxItemByID(inboxItemID);
    setInboxItem(tempInboxItem);
  });

  return (
    <IonPage id="view-inbox-item">
      <CustomPage
        showLargeHeader={false}
        name={pageName}
        sideMenu={false}
        backButton={true}
        backButtonText="Inbox">
        {inboxItem ? (
          <>
            <IonItem>
              <IonIcon
                icon={personCircle}
                color="primary"></IonIcon>
              <IonLabel className="ion-text-wrap">
                <h2>
                  {inboxItem.sender}
                  <span className="date">
                    <IonNote>{inboxItem.time}</IonNote>
                  </span>
                </h2>
                <h3>
                  To: <IonNote>Me</IonNote>
                </h3>
              </IonLabel>
            </IonItem>

            <div className="ion-padding">
              <h1>{inboxItem.subject}</h1>
              <p>{inboxItem.message}</p>
            </div>
          </>
        ) : (
          <div>Message not found</div>
        )}
      </CustomPage>
    </IonPage>
  );
};

export default InboxItem;
