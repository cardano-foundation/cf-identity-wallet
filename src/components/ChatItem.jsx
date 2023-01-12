import React from 'react';
import { IonIcon, IonItem } from '@ionic/react';
import {checkmarkDone, cloudCircle, wifiOutline} from 'ionicons/icons';
const ChatItem = ({ chat }) => {
  const { messages, name, read, date, preview, received, connected  } = chat;

  const notificationCount = messages?.length && messages.filter((chat) => chat.read === false).length || 0;

  return (
    <div className='chat-row' id='chat-row'>
      <img src={"https://via.placeholder.com/150"} alt='avatar' />

      <IonItem
        className='chat-content-container'
        routerLink={`/chats/${chat.key}`}
        detail={false}
      >
        <div className='chat-content'>
          <div className='chat-name-date'>
            <h2>{name}
              <span className="ml-3 color">{connected ? <IonIcon size='small' icon={wifiOutline} color='success' />
                : <IonIcon size='small' icon={wifiOutline} color='gray' />}
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
