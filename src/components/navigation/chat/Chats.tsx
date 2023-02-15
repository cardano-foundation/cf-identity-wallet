import React, {useEffect, useRef, useState} from 'react';
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import CustomPage from '../../shared/CustomPage';
import {useSideMenuUpdate} from '../../shared/SideMenuProvider';
import {pencilOutline} from 'ionicons/icons';
import './Chats.css';
import ChatItem from './ChatItem';
import {
  getHostList,
  getPeerList,
  getPeerProfile,
  setPeerProfile,
} from '../../../db';
import {handleConnect} from '../../../App';
import {useHistory} from 'react-router-dom';
import {subscribe} from '../../../utils/events';

const Chats = (props: any) => {
  const pageName = 'Chats';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();
  const [results, setResults] = useState([]);
  const [userName, setUsername] = useState('');
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerNameInput, setCreateServerNameInput] = useState('');
  const [joinServerNameInput, setJoinServerNameInput] = useState('');
  const [joinServerAddressInput, setJoinServerAddressInput] = useState('');
  const [showConnectDapp, setShowConnectDapp] = useState(false);
  const nav = useHistory();
  const modal = useRef(null);

  useEffect(() => {
    if (props.location.pathname === '/tabs/chats') {
      setSideMenu({
        options: sideMenuOptions,
        pageName: pageName,
      });
    }
  }, [props.location]);

  useEffect(() => {
    updateChats();
  }, []);

  const openModal = () => {
    nav.push(nav.location.pathname + '?modalOpened=true');
  };

  const handleUserName = async (username) => {
    setUsername(username);
    await getPeerProfile('global').then((profile) => {
      setPeerProfile(
        'global',
        profile.seed,
        profile.identifier,
        profile.name,
        profile.announce,
        profile.messages,
        username
      );
    });
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
    getPeerProfile('global').then((profile) => {
      if (profile.username?.length) {
        setUsername(profile.username);
      }
    });

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
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={true}>
        <IonContent>
          <IonHeader>
            <IonToolbar className="ion-text-center">
              <IonChip className="">
                <IonAvatar>
                  <img
                    alt="Silhouette of a person's head"
                    src="https://ionicframework.com/docs/img/demos/avatar.svg"
                  />
                </IonAvatar>
                <IonLabel>
                  <IonItem>
                    <IonInput
                      value={userName}
                      onIonChange={(e) => handleUserName(e.target.value)}
                      placeholder="Enter user name"
                    />
                  </IonItem>
                </IonLabel>
                <IonIcon icon={pencilOutline} />
              </IonChip>
            </IonToolbar>
            <IonToolbar className="ion-text-center">
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
                <IonContent className="ion-padding p-8 px-12">
                  <IonList>
                    <IonLabel
                      class="ion-text-wrap"
                      position="stacked">
                      Create a new p2p channel with WebRTC and WebTorrent
                      trackers.
                    </IonLabel>
                    <IonInput
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
                  </IonList>
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
                  <IonList>
                    <IonLabel
                      class="ion-text-wrap"
                      position="stacked">
                      Connect through WebRTC and WebTorrent trackers.
                    </IonLabel>
                    <IonInput
                      value={joinServerNameInput}
                      onIonChange={(e) =>
                        setJoinServerNameInput(e.target.value)
                      }
                      placeholder="Name"
                      type="text"
                      required
                    />
                    <IonInput
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
                  <IonList>
                    <IonLabel
                      class="ion-text-wrap"
                      position="stacked">
                      This is a work in progress...
                    </IonLabel>
                  </IonList>
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
      </CustomPage>
    </IonPage>
  );
};

export default Chats;
