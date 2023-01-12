import React from 'react';
import { IonIcon, IonItem } from '@ionic/react';
import { checkmarkDone } from 'ionicons/icons';
import ContactStore from '../../store/ContactStore';
import { getContacts } from '../../store/selectors';

const ChatItem = ({ chat }) => {
  const contacts = ContactStore.useState(getContacts);
  const { chats, contact_id } = chat;
  const { read, date, preview, received } = chats[chats.length - 1];
  const contact = contacts.filter((c) => c.id === contact_id)[0];
  const notificationCount = chats.filter((chat) => chat.read === false).length;

  return (
    <div className="chat-row" id="chat-row">
      <img src={contact.avatar} alt="avatar" />

      <IonItem
        className="chat-content-container"
        routerLink={`/view-chat/${contact.id}`}
        detail={false}
      >
        <div className="chat-content">
          <div className="chat-name-date">
            <h2>{contact.name}</h2>
          </div>
          <p className="ion-text-wrap">
            {read && received && (
              <IonIcon icon={checkmarkDone} color="primary" />
            )}
            {preview}
          </p>
        </div>

        <div className="chat-details">
          <p className={`chat-date ${notificationCount > 0 && 'chat-unread'}`}>
            {date}
          </p>

          {notificationCount > 0 && (
            <div className="chat-notification">{notificationCount}</div>
          )}
        </div>
      </IonItem>
    </div>
  );
};

export default ChatItem;
