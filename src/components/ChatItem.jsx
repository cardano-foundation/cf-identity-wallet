import React from 'react';
import { IonIcon, IonItem } from '@ionic/react';
import {checkmarkDone, closeCircleOutline, cloudCircle} from 'ionicons/icons';
import ContactStore from '../store/ContactStore';
import { getContacts } from '../store/Selectors';

const ChatItem = ({ chat }) => {
  const contacts = ContactStore.useState(getContacts);
  const { messages, name, read, date, preview, received, connected  } = chat;

  const contact = contacts[0];
  const notificationCount = messages?.length && messages.filter((chat) => chat.read === false).length || 0;

  console.log("ChatItem");
  console.log(chat);
  return (
    <div className='chat-row' id='chat-row'>
      <img src={contact.avatar} alt='avatar' />

      <IonItem
        className='chat-content-container'
        routerLink={`/chats/${chat.key}`}
        detail={false}
      >
        <div className='chat-content'>
          <div className='chat-name-date'>
            <h2>{name}
              <span className="ml-3 color">{connected ? <IonIcon size='small' icon={cloudCircle} color='success' />
                : <IonIcon size='small' icon={cloudCircle} color='gray' />}
              </span>
            </h2>
          </div>
          <p className='ion-text-wrap'>
            {read && received && (
              <IonIcon icon={checkmarkDone} color='primary' />
            )}
            {preview.message.message}
          </p>
        </div>

        <div className='chat-details'>
          <p className={`chat-date ${notificationCount > 0 && 'chat-unread'}`}>
            {date}
          </p>

          {notificationCount > 0 && (
            <div className='chat-notification'>{notificationCount}</div>
          )}
        </div>
      </IonItem>
    </div>
  );
};

export default ChatItem;
