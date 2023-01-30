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
  IonList,
  IonLabel,
  IonInput,
  IonRefresherContent,
  IonRefresher,
} from '@ionic/react';
import './Chats.css';
import {useEffect, useState} from 'react';
import ChatItem from './ChatItem';
import {useRef} from 'react';
import {extendMoment} from 'moment-range';
import Moment from 'moment';
import {getHostList, getPeerList} from '../../db';
import {handleConnect} from '../../App';
import {useHistory} from 'react-router-dom';
import {subscribe} from '../../utils/events';
// @ts-ignore
const moment = extendMoment(Moment);

const Chats = () => {
  const pageRef = useRef();

  const [results, setResults] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerNameInput, setCreateServerNameInput] = useState('');
  const [joinServerNameInput, setJoinServerNameInput] = useState('');
  const [joinServerAddressInput, setJoinServerAddressInput] = useState('');
  const [showConnectDapp, setShowConnectDapp] = useState(false);
  const nav = useHistory();
  const modal = useRef(null);

  useEffect(() => {
    updateChats();
  }, []);

  const openModal = () => {
    nav.push(nav.location.pathname + '?modalOpened=true');
  };

  const closeModal = () => {
    nav.replace('/chats');
  };

  useEffect(() => {
    subscribe('updateChat', () => {
      updateChats();
    });
  }, []);

  const updateChats = () => {
    getPeerList().then((peers) => {
      let peerList = [];
      if (peers) {
        peerList = Object.values(peers).map((peer, index) => {
          if (!peer.messages) return;
          const messages = peer?.messages?.length
            ? peer?.messages.map((message, index) => {
                return {
                  ...message,
                  id: index,
                };
              })
            : [];
          return {
            id: index,
            identifier: peer.identifier,
            key: `${peer.name}:${peer.identifier}`,
            name: peer.name,
            contact_id: index,
            preview:
              (messages.length && messages[messages.length - 1].preview) || '',
            messages,
            connected: peer.connected,
            host: false,
          };
        });
      }
      setResults(peerList);
    });
  };
  const handleRefresh = (event) => {
    updateChats();
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 1500);
  };
  const search = (e) => {
    const searchTerm = e.target.value;

    if (searchTerm !== '') {
      const searchTermLower = searchTerm.toLowerCase();

      const newResults = results.filter((chat) =>
        results
          .filter((c) => c.id === chat.contact_id)[0]
          .name.toLowerCase()
          .includes(searchTermLower)
      );
      setResults(newResults);
    }
  };

  const createNewChannel = async () => {
    const hosts = await getHostList();
    if (
      !createServerNameInput?.length ||
      (hosts &&
        Object.entries(hosts).some(
          (host) => host.name === createServerNameInput
        ))
    )
      return;

    handleConnect.createChannel(createServerNameInput);
    updateChats();
  };

  const joinNewChannel = async () => {
    const peers = await getPeerList();
    if (
      (!joinServerNameInput?.length && !joinServerAddressInput?.length) ||
      (peers &&
        Object.entries(peers).some((peer) => peer.name === joinServerNameInput))
    )
      return;

    handleConnect.joinChannel(joinServerNameInput, joinServerAddressInput);
    updateChats();
  };

  useEffect(() => {
    if (showConnectDapp) {
      //  Something happens!
    }
  }, [showConnectDapp]);

  function onWillDismiss(ev) {
    closeModal();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Chats</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonHeader>
          <IonToolbar class="ion-text-center">
            <IonButton
              class="ion-margin-horizontal"
              size="small"
              onClick={() => {
                setShowCreateServer(true);
                openModal();
              }}
              id="open-create">
              Create
            </IonButton>
            <IonModal
              isOpen={showCreateServer}
              ref={modal}
              trigger="open-create"
              onWillDismiss={(ev) => onWillDismiss(ev)}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Create Channel</IonTitle>
                  <IonButtons slot="end">
                    <IonButton
                      onClick={() => {
                        setShowCreateServer(false);
                        closeModal();
                      }}>
                      Close
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent className="ion-padding">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Set a channel name</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      <IonLabel
                        class="ion-text-wrap"
                        position="stacked">
                        Create a new p2p channel with WebRTC and WebTorrent
                        trackers.
                      </IonLabel>
                      <IonInput
                        className="ion-margin-vertical"
                        value={createServerNameInput}
                        onIonChange={(e) =>
                          setCreateServerNameInput(e.target.value)
                        }
                        placeholder="Name"
                        type="text"
                        required
                      />
                      <IonButton
                        disabled={!createServerNameInput?.length}
                        expand="block"
                        onClick={() => createNewChannel()}>
                        Create
                      </IonButton>
                      <br />
                      <IonLabel
                        class="ion-text-wrap"
                        position="stacked">
                        About the Channel ID...
                      </IonLabel>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonContent>
            </IonModal>
            <IonButton
              class="ion-margin-horizontal"
              size="small"
              onClick={() => {
                setShowJoinServer(true);
                openModal();
              }}
              id="open-join">
              Join
            </IonButton>
            <IonModal
              isOpen={showJoinServer}
              ref={modal}
              trigger="open-join"
              onWillDismiss={(ev) => onWillDismiss(ev)}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Join Server</IonTitle>
                  <IonButtons slot="end">
                    <IonButton
                      onClick={() => {
                        setShowJoinServer(false);
                        closeModal();
                      }}>
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
                      <IonLabel
                        class="ion-text-wrap"
                        position="stacked">
                        Connect through WebRTC and WebTorrent trackers.
                      </IonLabel>
                      <IonInput
                        className="ion-margin-vertical"
                        value={joinServerNameInput}
                        onIonChange={(e) =>
                          setJoinServerNameInput(e.target.value)
                        }
                        placeholder="Name"
                        type="text"
                        required
                      />
                      <IonInput
                        className="ion-margin-vertical"
                        value={joinServerAddressInput}
                        onIonChange={(e) =>
                          setJoinServerAddressInput(e.target.value)
                        }
                        placeholder="Address"
                        type="text"
                        required
                      />

                      <IonButton
                        disabled={
                          !joinServerNameInput?.length ||
                          !joinServerAddressInput?.length
                        }
                        expand="block"
                        onClick={() => joinNewChannel()}>
                        Join
                      </IonButton>
                    </IonList>
                  </IonCardContent>
                </IonCard>
              </IonContent>
            </IonModal>
            <IonButton
              class="ion-margin-horizontal"
              size="small"
              onClick={() => {
                setShowConnectDapp(true);
                openModal();
              }}
              id="open-dapp">
              dApp
            </IonButton>
            <IonModal
              isOpen={showConnectDapp}
              ref={modal}
              trigger="open-dapp"
              onWillDismiss={(ev) => onWillDismiss(ev)}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Connect dApp</IonTitle>
                  <IonButtons slot="end">
                    <IonButton
                      onClick={() => {
                        setShowConnectDapp(false);
                        closeModal();
                      }}>
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
                      <IonLabel
                        class="ion-text-wrap"
                        position="stacked">
                        Some placeholder text goes here as if it was a lorem
                        ipsum but better.
                      </IonLabel>
                      <IonInput
                        className="ion-margin-vertical"
                        placeholder="Name"
                      />
                      <IonButton expand="block">Connect</IonButton>
                      <br />
                      <IonLabel
                        class="ion-text-wrap"
                        position="stacked">
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

        <IonRefresher
          slot="fixed"
          onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        {results.map((chat, index) => {
          return (
            <ChatItem
              chat={chat}
              key={index}
            />
          );
        })}
      </IonContent>
    </IonPage>
  );
};

export default Chats;
