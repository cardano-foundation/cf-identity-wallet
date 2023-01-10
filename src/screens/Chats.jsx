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
  IonSearchbar, IonList, IonLabel, IonInput,
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
import {peerConnect} from "../api/p2p/PeerConnect";


const Chats = () => {
  const pageRef = useRef();
  const contacts = ContactStore.useState(getContacts);
  const latestChats = ChatStore.useState(getChats);

  const [results, setResults] = useState(latestChats);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerNameInput, setCreateServerNameInput] = useState('');
  const [joinServerNameInput, setJoinServerNameInput] = useState('');
  const [joinServerAddressInput, setJoinServerAddressInput] = useState('');
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

  const createNewChannel = () => {

    console.log("createNewChannel");
    if (!createServerNameInput?.length) return;

    peerConnect.createChannel(createServerNameInput);

  }
  const joinNewChannel = () => {

    console.log("joinNewChannel");
    if (!joinServerNameInput?.length && !joinServerAddressInput?.length) return;

    peerConnect.joinChannel(joinServerNameInput, joinServerAddressInput);

  }

  useEffect(() => {
    if (showConnectDapp) {
      //  Something happens!
    }
  }, [showConnectDapp]);

  console.log("peerConnect");
  console.log(peerConnect);
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
                  <IonTitle>Create Channel</IonTitle>
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
                    <IonCardTitle>Set a channel name</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonLabel class='ion-text-wrap' position='stacked'>
                        Create a new p2p channel with WebRTC and WebTorrent
                        trackers.
                      </IonLabel>
                      <IonInput
                          value={createServerNameInput}
                          onIonChange={(e) => setCreateServerNameInput(e.target.value)}
                          placeholder='Name'
                          type="text"
                          required
                          />
                      <IonButton
                          disabled={!createServerNameInput?.length}
                          expand='block'
                          onClick={() => createNewChannel()}>
                        Create
                      </IonButton>
                      <br />
                      <IonLabel class='ion-text-wrap' position='stacked'>
                        About the Channel ID...
                      </IonLabel>
                    </IonList>
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
                    <IonList>
                      <IonLabel class='ion-text-wrap' position='stacked'>
                        Connect through WebRTC and WebTorrent trackers.
                      </IonLabel>
                      <IonInput
                          value={joinServerNameInput}
                          onIonChange={(e) => setJoinServerNameInput(e.target.value)}
                          placeholder='Name'
                          type="text"
                          required
                      />
                      <IonInput
                          value={joinServerAddressInput}
                          onIonChange={(e) => setJoinServerAddressInput(e.target.value)}
                          placeholder='Address'
                          type="text"
                          required
                      />

                      <IonButton
                          disabled={!joinServerNameInput?.length || !joinServerAddressInput?.length}
                          expand='block'
                          onClick={() => joinNewChannel()}>
                        Join
                      </IonButton>
                    </IonList>
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
                    <IonList>
                      <IonLabel class='ion-text-wrap' position='stacked'>
                        Some placeholder text goes here as if it was a lorem
                        ipsum but better.
                      </IonLabel>
                      <IonInput placeholder='Name'/>
                      <IonButton expand='block'>Connect</IonButton>
                      <br />
                      <IonLabel class='ion-text-wrap' position='stacked'>
                        This is a work in progress...
                      </IonLabel>
                    </IonList>
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
