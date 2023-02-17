import React, {useEffect, useRef, useState} from 'react';
import {
  CreateAnimation,
  createGesture,
  IonActionSheet,
  IonBackButton,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  alertOutline,
  send,
  shareOutline,
  starOutline,
  trash,
  trashOutline,
  wifiOutline,
} from 'ionicons/icons';

import {useParams} from 'react-router';
import {useLongPress} from 'react-use';
import './Chat.css';
import ReplyTo from './ReplyTo';
import {ChatBottomDetails} from './ChatBottomDetails';
import {ChatRepliedQuote} from './ChatRepliedQuote';

import {writeToClipboard} from '../../../../utils/clipboard';
import {useHistory, useLocation} from 'react-router-dom';
import {addressSlice} from '../../../../utils/utils';
import {handleConnect} from '../../../../App';
import {subscribe} from '../../../../utils/events';
import { HandleConnect } from '../../../../api/p2p/HandleConnect';
import { PeerConnect } from '../../../../api/p2p/PeerConnect';
import { PouchAPI } from '../../../../db/database';

const Chat = () => {
  const params = useParams();
  const location = useLocation();

  //  Global State
  const notificationCount = 0;

  //  Local state
  const [chat, serChat] = useState(location?.state?.chat || {});
  const [message, setMessage] = useState('');
  const [showSendButton, setShowSendButton] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionMessage, setActionMessage] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  //  Refs
  const contentRef = useRef();
  const swiperRefs = useRef([]);
  const textareaRef = useRef();
  const sideRef = useRef();
  const sendRef = useRef();
  const replyToAnimationRef = useRef();

  const actionSheetButtons = [
    {
      text:
        actionMessage && actionMessage.starred
          ? 'Unstar Message'
          : 'Star Message',
      icon: starOutline,
      handler: () => {},
    },
    actionMessage && actionMessage.received
      ? {
          text: 'Reply To Message',
          icon: shareOutline,
          handler: () => showReplyToMessage(actionMessage),
        }
      : {
          text: 'Unsend Message',
          icon: alertOutline,
          handler: () =>
            toaster(
              "I haven't implemented unsend :) Simple store update though"
            ),
        },
    {
      text: 'Delete Message',
      icon: trashOutline,
      handler: () =>
        toaster("I haven't implemented delete :) Simple store update though"),
      role: 'destructive',
    },
  ];

  useEffect(() => {
    updateChat();
  }, []);
  useEffect(() => {
    !showActionSheet && setActionMessage(false);
  }, [showActionSheet]);

  useEffect(() => {
    subscribe('updateChat', () => {
      console.log('subscribe updateChat, lets update!');
      updateChat();
    });
  }, []);

  const updateChat = async () => {
    if (!params) return;
    console.log("params");
    console.log(params);
    const chat = await HandleConnect.getPeer(PeerConnect.table, params.channel_id);
    if (chat) serChat(chat);
  };
  const pingChat = async () => {
    if (!params) return;
    const name = params.channel_id.split(':')[0];
    const identifier = params.channel_id.split(':')[1];
    handleConnect.pingServer(identifier, `peer:${params.channel_id}`, name);
  };

  const history = useHistory();
  const handleNavigation = (route) => {
    history.push({
      pathname: route,
      search: '?update=true', // query string
      state: {
        // location state
        update: true,
      },
    });
  };

  //  Scroll to end of content
  //  Mark all chats as read if we come into a chat
  //  Set up our swipe events for animations and gestures
  useIonViewWillEnter(() => {
    scrollToBottom();
    setupObserver();
    // markAllAsRead(params.contact_id);
    setSwipeEvents();
  });

  //  For displaying toast messages
  const toaster = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  //  Scroll to end of content
  const scrollToBottom = async () => {
    contentRef.current.scrollToBottom();
  };

  //  Watch for DOM changes
  //  Then scroll to bottom
  //  This ensures that the new chat message has *actually* been rendered
  //  Check this:
  //  https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  const setupObserver = () => {
    //  Mutation Observers watch for DOM changes
    //  This will ensure that we scroll to bottom AFTER the new chat has rendered
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    //  We observe the ion-content (or containing element of chats)
    observer.observe(contentRef.current, {
      childList: true,
    });
  };

  //  Long press callback
  const onLongPress = (e) => {
    const elementID = e.target.id;
    const chatMessageID = elementID.includes('chatText')
      ? parseInt(elementID.replace('chatText_', ''))
      : elementID.includes('chatTime')
      ? parseInt(elementID.replace('chatTime_', ''))
      : parseInt(elementID.replace('chatBubble_', ''));

    /*
    const chatMessage = chat.filter(
      (message) => parseInt(message.id) === parseInt(chatMessageID)
    )[0];
    */

    // setActionMessage(chatMessage);
    setShowActionSheet(true);
  };

  const longPressEvent = useLongPress(onLongPress, {
    isPreventDefault: true,
    delay: 2000,
  });

  const showReplyToMessage = async (message) => {
    //  Activate reply-to functionality
    setReplyToMessage(message);
    await replyToAnimationRef.current.animation.play();
    contentRef.current.scrollToBottom(300);
  };

  const checkBubble = async (bubble, message, event) => {
    if (event.deltaX >= 120) {
      //  Activate reply-to functionality
      bubble.style.transform = 'none';
      showReplyToMessage(message);
    } else {
      //  Put chat bubble back to original position
      bubble.style.transform = 'none';
    }
  };

  //  Function to move a bubble with the deltaX swipe
  const moveBubble = (bubble, event) => {
    if (event.velocityX > 0) {
      bubble.style.transform = `translateX(${event.deltaX}px)`;
    }
  };

  const setSwipeEvents = () => {
    chat?.messages?.forEach((message, index) => {
      if (!message.sent) {
        const chatBubble = swiperRefs.current[index];

        const swipeGesture = createGesture({
          el: chatBubble,
          onEnd: (e) => checkBubble(chatBubble, message, e),
          onMove: (e) => moveBubble(chatBubble, e),
        });

        swipeGesture.enable();
      }
    });
  };

  const widthAnimation = {
    property: 'width',
    fromValue: '100%',
    toValue: '100%',
  };

  const fadeAnimation = {
    property: 'opacity',
    fromValue: '100%',
    toValue: '0%',
  };

  const sideButtonsAnimation = {
    duration: 200,
    direction: showSendButton ? 'normal' : 'reverse',
    iterations: '1',
    fromTo: [fadeAnimation],
    easing: 'ease-in-out',
  };

  const sendButtonAnimation = {
    duration: showSendButton ? 300 : 100,
    direction: !showSendButton ? 'normal' : 'reverse',
    iterations: '1',
    fromTo: [fadeAnimation],
    easing: 'ease-in-out',
  };

  const textareaAnimation = {
    duration: 200,
    direction: !showSendButton ? 'normal' : 'reverse',
    iterations: '1',
    fromTo: [widthAnimation],
    easing: 'ease-in-out',
  };

  //  Set the state value when message val changes
  useEffect(() => {
    setShowSendButton(message !== '');
  }, [message]);

  //  Play the animations when the state value changes
  useEffect(() => {
    textareaRef.current.animation.play();
    //sideRef.current.animation.play();
    //sendRef.current.animation.play();
  }, [showSendButton]);

  useEffect(() => {
    const updateState = setTimeout(() => {
      updateChat();
    }, 4000);

    return () => clearInterval(updateState);
  }, []);

  const removeChat = async () => {
    const id = `${chat?.name}:${chat?.identifier}`;
    console.log("removeChat");
    console.log(id);
    const css = await PouchAPI.getTable(PeerConnect.table)
    console.log("css");
    console.log(css);
    await HandleConnect.removePeer(id);
    await HandleConnect.removeHost(id.replace('peer', 'host'));

    handleNavigation('/tabs/chats');
  };
  const sendMessage = async () => {
    console.log('sendMessage');
    if (message !== '') {
      try {
        const name = params.channel_id.split(':')[0];
        const identifier = params.channel_id.split(':')[1];

        const profile = await PouchAPI.getWithIndex(PeerConnect.table, 'default-profile');
        handleConnect.sendMessage(
          identifier,
          `peer:${params.channel_id}`,
          name,
          message,
          profile.username
        );
        setMessage('');
        setMessageSent(true);
        setTimeout(() => setMessageSent(false), 10);
        setTimeout(() => updateChat() && scrollToBottom(), 200);
      } catch (e) {
        console.log('error:');
        console.log(e);
        setToastMessage(`Error: ${e}`);
        setToastColor('danger');
        setShowToast(true);
      }
    }
  };

  const replyToProps = {
    replyToAnimationRef,
    replyToMessage,
    setReplyToMessage,
    contact: 'name',
    messageSent,
  };

  const onCopy = (content) => {
    writeToClipboard(content).then(() => {
      setToastColor('success');
      setToastMessage(`Copied: ${content}`);
      setShowToast(true);
    });
  };

  const handleRefresh = (event) => {
    updateChat();
    setTimeout(() => {
      // Any calls to load data go here
      event.detail.complete();
    }, 2000);
  };

  return (
    <IonPage className="chat-page">
      <IonHeader>
        <IonToolbar>
          <IonBackButton
            defaultHref={'/tabs/chats'}
            slot="start"
            text={notificationCount > 0 ? notificationCount : ''}
          />
          <IonTitle>
            <div className="chat-contact">
              <img
                src={'https://via.placeholder.com/150'}
                alt="avatar"
              />
              <div className="chat-contact-details">
                <p>
                  {chat?.name}
                  <span
                    className="ml-3 color"
                    onClick={() => pingChat()}>
                    {chat?.connected ? (
                      <IonIcon
                        size="small"
                        icon={wifiOutline}
                        color="success"
                      />
                    ) : (
                      <IonIcon
                        size="small"
                        icon={wifiOutline}
                        color="gray"
                      />
                    )}
                  </span>
                </p>
                <IonText
                  color="medium cursor-pointer"
                  onClick={() => onCopy(chat?.identifier)}>
                  {addressSlice(chat?.identifier, 10)}
                </IonText>
              </div>
            </div>
          </IonTitle>
          <IonIcon
            className="mx-2 cursor-pointer"
            slot="end"
            icon={trash}
            onClick={() => removeChat()}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent
        id="main-chat-content"
        ref={contentRef}>
        {chat &&
          Object.keys(chat).length &&
          chat?.messages.map((message, index) => {
            /*
          const repliedMessage = chat.filter(
            (subMessage) =>
              parseInt(subMessage.id) === parseInt(message.replyID)
          )[0];
          */
            return (
              <div
                ref={(ref) => (swiperRefs.current[index] = ref)}
                id={`chatBubble_${index}`}
                key={index}
                className={`chat-bubble ${
                  message.self ? 'bubble-sent' : 'bubble-received'
                }`}
                {...longPressEvent}>
                {message?.sender ? (
                  <div
                    className={`mr-2 ${
                      message.self ? 'chat-bottom-details' : ''
                    }`}>
                    <span
                      onClick={() => onCopy(message.sender.address)}
                      className={`cursor-pointer text-sm rounded p-1 text-white opacity-75 bg-${
                        message.self ? 'green' : 'gray'
                      }-400`}>
                      {message.username?.length
                        ? `@${message.username}`
                        : addressSlice(message.sender.address, 2)}
                    </span>
                  </div>
                ) : null}
                <div id={`chatText_${index}`}>
                  <ChatRepliedQuote
                    message={message?.preview}
                    contact={null}
                    //repliedMessage={repliedMessage}
                  />
                  {message?.preview}
                  <ChatBottomDetails message={message} />
                </div>

                <div className={`bubble-arrow ${message.self && 'alt'}`}></div>
              </div>
            );
          })}

        <IonRefresher
          slot="fixed"
          onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonActionSheet
          header="Message Actions"
          subHeader={actionMessage && actionMessage.preview?.message}
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={actionSheetButtons}
        />
        <IonToast
          color={toastColor}
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          position="bottom"
          duration="3000"
        />
      </IonContent>

      {replyToMessage && <ReplyTo {...replyToProps} />}

      <IonFooter
        className="chat-footer"
        id="chat-footer">
        <IonGrid>
          <IonRow className="ion-align-items-center">
            <IonItem color="transparent">
              <IonCheckbox
                disabled={true}
                slot="start"></IonCheckbox>
            </IonItem>
            <div className="chat-input-container">
              <CreateAnimation
                ref={textareaRef}
                {...textareaAnimation}>
                <IonTextarea
                  rows="1"
                  disabled={!chat?.connected}
                  value={message}
                  onIonChange={(e) => setMessage(e.target.value)}
                />
              </CreateAnimation>
            </div>

            <CreateAnimation
              ref={sendRef}
              {...sendButtonAnimation}>
              <IonCol
                size="1"
                className="chat-send-button"
                onClick={sendMessage}>
                <IonIcon icon={send} />
              </IonCol>
            </CreateAnimation>
          </IonRow>
        </IonGrid>
      </IonFooter>
    </IonPage>
  );
};

export default Chat;
