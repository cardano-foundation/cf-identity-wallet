import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import ContactStore from '../../store/ContactStore';
import { getContacts } from '../../store/selectors';

import './ContactModal.scss';

const ContactModal = ({ close }) => {
  const contacts = ContactStore.useState(getContacts);

  return (
    <div style={{ height: '100%' }}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>New Chat</IonTitle>
          <IonButtons slot='end'>
            <IonButton fill='clear' onClick={close}>
              Cancel
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          {contacts.map((contact) => {
            return (
              <IonItem
                key={`contact_${contact.id}`}
                lines='full'
                className='contact-item'
              >
                <img src={contact.avatar} alt='contact avatar' />
                <IonLabel>
                  <h1>{contact.name}</h1>
                  <p>Available</p>
                </IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </div>
  );
};

export default ContactModal;
