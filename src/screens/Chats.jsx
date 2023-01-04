import React from 'react';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonModal,
} from '@ionic/react';
import { checkmarkDone, createOutline } from 'ionicons/icons';
import './Chats.css';

import ChatStore from '../store/ChatStore';
import ContactStore from '../store/ContactStore';
import { getContacts, getChats } from '../store/Selectors';
import { useEffect, useState } from 'react';
import ChatItem from '../components/ChatItem';
import { useRef } from 'react';
import ContactModal from '../components/ContactModal';

const Chats = () => {
  const pageRef = useRef();
  const contacts = ContactStore.useState(getContacts);
  const latestChats = ChatStore.useState(getChats);

  const [results, setResults] = useState(latestChats);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    setResults(latestChats);
  }, [latestChats]);

  const search = (e) => {
    const searchTerm = e.target.value;

    if (searchTerm !== '') {
      const searchTermLower = searchTerm.toLowerCase();

      const newResults = latestChats.filter((chat) =>
        contacts
          .filter((c) => c.id === chat.contact_id)[0]
          .name.toLowerCase()
          .includes(searchTermLower)
      );
      setResults(newResults);
    } else {
      setResults(latestChats);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Chats</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader>
          <IonToolbar>
            <IonTitle size='large'>Chats</IonTitle>
          </IonToolbar>
          <IonSearchbar onIonChange={(e) => search(e)} />
        </IonHeader>

        {results.map((chat, index) => {
          return <ChatItem chat={chat} key={index} />;
        })}

        <IonModal
          isOpen={showContactModal}
          swipeToClose={true}
          presentingElement={pageRef.current}
          onDidDismiss={() => setShowContactModal(false)}
        >
          <ContactModal close={() => setShowContactModal(false)} />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Chats;
