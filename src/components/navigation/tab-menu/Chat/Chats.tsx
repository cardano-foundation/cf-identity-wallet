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
  IonModal, IonNote,
  IonPage, IonPopover,
  IonRefresher,
  IonRefresherContent, IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import PageLayout from '../../../layouts/PageLayout';
import {useSideMenuUpdate} from '../../side-menu/SideMenuProvider';
import {people, createOutline, pencilOutline, qrCodeOutline, addCircleOutline} from 'ionicons/icons';
import './Chats.scss';
import ChatItem from './ChatItem';
import {handleConnect} from '../../../AppWrapper';
import {useHistory} from 'react-router-dom';
import {subscribe} from '../../../../utils/events';
import { PouchAPI } from '../../../../db/database';
import { PeerConnect } from '../../../../api/p2p/PeerConnect';
import { HandleConnect } from '../../../../api/p2p/HandleConnect';

const Chats = (props: any) => {
  const pageName = 'Chats';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();
  const [originalPeers, setOriginalPeers] = useState([]);
  const [results, setResults] = useState([]);
  const [username, setUsername] = useState('');
  const [usernameIsValid, setUsernameIsValid] = useState(undefined);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinServer, setShowJoinServer] = useState(false);
  const [createServerNameInput, setCreateServerNameInput] = useState('');
  const [joinServerNameInput, setJoinServerNameInput] = useState('');
  const [joinServerAddressInput, setJoinServerAddressInput] = useState('');
  const [showConnectDapp, setShowConnectDapp] = useState(false);
  const nav = useHistory();
  const modal = useRef(null);

  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

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

  const closeModal = () => {
    setShowJoinServer(false);
    setShowCreateServer(false);
    nav.replace('/tabs/chats');
  };

  useEffect(() => {
    subscribe('updateChat', () => {
      updateChats();
    });
  }, []);

  const updateChats = () => {
    PouchAPI.get(PeerConnect.table, 'default-profile').then(profile => {
      if (profile?.username?.length) {
        setUsername(profile.username);
      }
    });

    HandleConnect.getPeers().then(peers => {
      let peerList = [];
      if (peers) {
        peerList = peers.map((peer, index:number) => {
          const messages = peer?.messages?.length
              ? peer?.messages.map((message, index:number) => {
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
      peerList = peerList.filter(peer => peer.name !== undefined);
      console.log("peerList");
      console.log(peerList);
      setOriginalPeers(peerList);
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
          .filter((c) => c.id === chat.id)[0]
          .name.toLowerCase()
          .includes(searchTermLower)
      );
      setResults(newResults);
    } else {
      setResults(originalPeers);
    }
  };

  const createNewChannel = async () => {
    const hosts = await HandleConnect.getHosts();
    if (
      !createServerNameInput?.length ||
      (hosts &&
          hosts.some(
          (host) => host.name === createServerNameInput
        ))
    )
      return;
    if (handleConnect){
      handleConnect.createChannel(createServerNameInput);
      updateChats();
    }
  };

  const joinNewChannel = async () => {
    const peers = await HandleConnect.getPeers();
    if (
      (!joinServerNameInput?.length && !joinServerAddressInput?.length) ||
      (peers &&
          peers.some((peer) => peer.name === joinServerNameInput))
    )
      return;

    if (handleConnect){
      handleConnect.joinChannel(joinServerNameInput, joinServerAddressInput);
      updateChats();
    }

  };

  useEffect(() => {
    if (showConnectDapp) {
      //  Something happens!
    }
  }, [showConnectDapp]);

  function onWillDismiss(ev) {
    closeModal();
  }

  const nameValidator = (text: string) => {
    // Lower and upper case alphanumeric between 2 and 16 characters
    return text.match(/^[a-zA-Z0-9_& -]{2,16}$/);
  };

  const validateUsername = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setUsername(value);
    setUsernameIsValid(undefined);
    if (value === '') return;
    nameValidator(value) !== null
        ? setUsernameIsValid(true)
        : setUsernameIsValid(false);

    if(nameValidator(value) || nameValidator(value) === undefined) {
      PouchAPI.set(PeerConnect.table, 'default-profile', {
        username: value
      });
    }
  };

  return (
    <IonPage id={pageName}>
      <PageLayout
        name={pageName}
        fullscreen={false}
        sideMenu={true}>
        <IonContent>
          <IonHeader>
            <IonToolbar className="ion-text-center">
              <IonItem
                className={`${usernameIsValid && 'ion-valid'} ${
                    usernameIsValid === false && 'ion-invalid'
                }`}
              >
                <IonLabel position="fixed" className="text-gray-600">Public name:</IonLabel>
                <IonInput
                    value={username}
                    onIonInput={(event) => validateUsername(event)}
                    placeholder="Enter your username 💬"/>
                <IonNote slot="error">Invalid name</IonNote>
              </IonItem>
            </IonToolbar>

            <div className="flex flex-wrap">
              <IonSearchbar onIonChange={(e) => search(e)} slot="start" className="inline-block w-11/12" />
              <IonIcon
                  className="text-2xl mt-5 cursor-pointer"
                  id={`popover-button-chats`}
                  icon={addCircleOutline}
                  slot="end"
              />
              <IonPopover
                  className="scroll-y-hidden"
                  trigger={`popover-button-chats`}
                  dismissOnSelect={true}
                  size={'auto'}
                  side="bottom"
                  ref={popover}
                  isOpen={popoverOpen}
                  onDidDismiss={() => setPopoverOpen(false)}>
                <>
                  <IonRow
                      className="cursor-pointer"
                      onClick={() => {
                        setShowCreateServer(true);
                        openModal();
                      }}
                  >
                    <IonItem className="px-4 py-2">
                      <IonIcon
                          slot="start"
                          icon={createOutline}
                      />
                      <IonLabel
                      >Create</IonLabel>
                    </IonItem>
                  </IonRow>
                  <IonRow
                      className="cursor-pointer"
                      onClick={() => {
                        setShowJoinServer(true);
                        openModal();
                      }}>
                    <IonItem className="px-4 py-2">
                      <IonIcon
                          slot="start"
                          icon={people}
                      />
                      <IonLabel
                      >Join</IonLabel>
                    </IonItem>
                  </IonRow>
                </>
              </IonPopover>
              <IonModal
                  isOpen={showCreateServer}
                  ref={modal}
                  trigger="open-create-chats"
                  onWillDismiss={(ev) => onWillDismiss(ev)}
                  initialBreakpoint={0.75} breakpoints={[0, 0.25, 0.5, 0.75]}
              >
                <IonHeader>
                  <IonToolbar>
                    <IonTitle>Create Chat</IonTitle>
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

              <IonModal
                  isOpen={showJoinServer}
                  ref={modal}
                  trigger="open-join-chats"
                  onWillDismiss={(ev) => onWillDismiss(ev)}
                  initialBreakpoint={0.75} breakpoints={[0, 0.25, 0.5, 0.75]}
              >
                <IonHeader>
                  <IonToolbar>
                    <IonTitle>Join</IonTitle>
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
                      Join Chat
                    </IonButton>
                  </IonList>
                </IonContent>
              </IonModal
              >
            </div>
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
      </PageLayout>
    </IonPage>
  );
};

export default Chats;
