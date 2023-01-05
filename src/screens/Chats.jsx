import React from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
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
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showConnectDapp, setShowConnectDapp] = useState(false);

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

  useEffect(() => {
    if (showConnectDapp) {
      //  Something happens!
    }
  }, [showConnectDapp]);

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
          <IonToolbar class='ion-text-center'>
            <IonButton
              class='ion-margin-horizontal'
              size='small'
              onClick={() => setShowCreateServer(true)}
            >
              Create
            </IonButton>
            <IonModal isOpen={showCreateServer}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Create Server</IonTitle>
                  <IonButtons slot='end'>
                    <IonButton onClick={() => setShowCreateServer(false)}>
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent className='ion-padding'>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Create a room</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <ion-list>
                      <ion-label class='ion-text-wrap' position='stacked'>
                        Create a new p2p server with WebRTC and WebTorrent
                        trackers.
                      </ion-label>
                      <ion-input placeholder='Name'></ion-input>
                      <IonButton expand='block'>Create</IonButton>
                      <br />
                      <ion-label class='ion-text-wrap' position='stacked'>
                        About the Room ID...
                      </ion-label>
                    </ion-list>
                  </IonCardContent>
                </IonCard>
              </IonContent>
            </IonModal>
            <IonButton
              class='ion-margin-horizontal'
              size='small'
              onClick={() => setShowJoinServer(true)}
            >
              Join
            </IonButton>
            <IonModal isOpen={showJoinServer}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Join Server</IonTitle>
                  <IonButtons slot='end'>
                    <IonButton onClick={() => setShowJoinServer(false)}>
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent className='ion-padding'>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Join a room</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <ion-list>
                      <ion-label class='ion-text-wrap' position='stacked'>
                        Connect through WebRTC and WebTorrent trackers.
                      </ion-label>
                      <ion-input placeholder='Room Name'></ion-input>
                      <ion-input placeholder='Room Address'></ion-input>
                      <IonButton expand='block'>Join</IonButton>
                    </ion-list>
                  </IonCardContent>
                </IonCard>
              </IonContent>
            </IonModal>
            <IonButton
              class='ion-margin-horizontal'
              size='small'
              onClick={() => setShowConnectDapp(true)}
            >
              dApp
            </IonButton>
            <IonModal isOpen={showConnectDapp}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Connect dApp</IonTitle>
                  <IonButtons slot='end'>
                    <IonButton onClick={() => setShowConnectDapp(false)}>
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent className='ion-padding'>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Connect dApp</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <ion-list>
                      <ion-label class='ion-text-wrap' position='stacked'>
                        Some placeholder text goes here as if it was a lorem
                        ipsum but better.
                      </ion-label>
                      <ion-input placeholder='Name'></ion-input>
                      <IonButton expand='block'>Connect</IonButton>
                      <br />
                      <ion-label class='ion-text-wrap' position='stacked'>
                        This is a work in progress...
                      </ion-label>
                    </ion-list>
                  </IonCardContent>
                </IonCard>
              </IonContent>
            </IonModal>
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
