import React, { useEffect, useState, useRef } from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonLabel,
  IonInput,
} from '@ionic/react';
import './Chats.css';
import ChatStore from '../../store/ChatStore';
import ContactStore from '../../store/ContactStore';
import { getContacts, getChats } from '../../store/selectors';
import ChatItem from './ChatItem';
import ContactModal from './ContactModal';
import {
  IonSearchbarCustomEvent,
  OverlayEventDetail,
  SearchbarChangeEventDetail,
} from '@ionic/core/components';

const Chats = () => {
  const pageRef = useRef();
  const contacts = ContactStore.useState(getContacts);
  const latestChats = ChatStore.useState(getChats);
  const [results, setResults] = useState(latestChats);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [showConnectDapp, setShowConnectDapp] = useState(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const input = useRef<HTMLIonInputElement>(null);

  useEffect(() => {
    setResults(latestChats);
  }, [latestChats]);

  const search = (e: IonSearchbarCustomEvent<SearchbarChangeEventDetail>) => {
    const searchTerm = e.target.value;
    if (searchTerm !== '') {
      const searchTermLower = searchTerm?.toLowerCase();
      const newResults = latestChats.filter((chat: { contact_id: any }) =>
        contacts
          .filter((c: { id: any }) => c.id === chat.contact_id)[0]
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

  function onWillDismiss(ev: CustomEvent<OverlayEventDetail>) {}

  return (
    <IonContent>
      <IonHeader>
        <IonToolbar class="ion-text-center">
          <IonButton
            class="ion-margin-horizontal"
            size="small"
            onClick={() => setShowCreateServer(true)}
            id="open-create"
          >
            Create
          </IonButton>
          <IonModal
            isOpen={showCreateServer}
            ref={modal}
            trigger="open-create"
            onWillDismiss={(ev) => onWillDismiss(ev)}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>Create Server</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowCreateServer(false)}>
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Create a room</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonLabel class="ion-text-wrap" position="stacked">
                      Create a new p2p server with WebRTC and WebTorrent
                      trackers.
                    </IonLabel>
                    <IonInput placeholder="Name" />
                    <IonButton expand="block">Create</IonButton>
                    <br />
                    <IonLabel class="ion-text-wrap" position="stacked">
                      About the Room ID...
                    </IonLabel>
                  </IonList>
                </IonCardContent>
              </IonCard>
            </IonContent>
          </IonModal>
          <IonButton
            class="ion-margin-horizontal"
            size="small"
            onClick={() => setShowJoinServer(true)}
            id="open-join"
          >
            Join
          </IonButton>
          <IonModal
            isOpen={showJoinServer}
            ref={modal}
            trigger="open-join"
            onWillDismiss={(ev) => onWillDismiss(ev)}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>Join Server</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowJoinServer(false)}>
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Join a room</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonLabel class="ion-text-wrap" position="stacked">
                      Connect through WebRTC and WebTorrent trackers.
                    </IonLabel>
                    <IonInput placeholder="Room Name" />
                    <IonInput placeholder="Room Address" />
                    <IonButton expand="block">Join</IonButton>
                  </IonList>
                </IonCardContent>
              </IonCard>
            </IonContent>
          </IonModal>
          <IonButton
            class="ion-margin-horizontal"
            size="small"
            onClick={() => setShowConnectDapp(true)}
            id="open-dapp"
          >
            dApp
          </IonButton>
          <IonModal
            isOpen={showConnectDapp}
            ref={modal}
            trigger="open-dapp"
            onWillDismiss={(ev) => onWillDismiss(ev)}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>Connect dApp</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowConnectDapp(false)}>
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Connect dApp</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonLabel class="ion-text-wrap" position="stacked">
                      Some placeholder text goes here as if it was a lorem ipsum
                      but better.
                    </IonLabel>
                    <IonInput placeholder="Name" />
                    <IonButton expand="block">Connect</IonButton>
                    <br />
                    <IonLabel class="ion-text-wrap" position="stacked">
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

      {results.map((chat: any, index: React.Key | null | undefined) => {
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
  );
};

export default Chats;
