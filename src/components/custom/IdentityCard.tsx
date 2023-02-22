import React, {useRef, useState} from 'react';
import {
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPopover,
  IonRow,
  IonToast,
} from '@ionic/react';
import {
  copyOutline,
  ellipsisVertical,
  informationCircleOutline,
  qrCodeOutline,
  trashOutline,
} from 'ionicons/icons';
import {useHistory} from 'react-router-dom';
import {writeToClipboard} from '../../utils/clipboard';
import {extendMoment} from 'moment-range';
import Moment from 'moment';

const moment = extendMoment(Moment);

export const IDWCard = ({
  type,
  id,
  qr,
  name,
  logo = null,
  createdOn,
  data = null,
}) => {
  const history = useHistory();

  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  const openPopover = (e: any) => {
    popover.current!.event = e;
    setPopoverOpen(true);
  };

  const handleMoreDetails = (dataObject: {id: any}) => {
    history.push({
      pathname: `/creds/${dataObject.id}`,
      state: {
        dataObject,
      },
    });
  };

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
      search: '?update=true', // query string
      state: {
        // location state
        id,
        name,
        createdOn,
      },
    });
  };

  const onCopy = (content: string) => {
    writeToClipboard(content).then(() => {
      setToastColor('success');
      setToastMessage(`Copied: ${content}`);
      setShowToast(true);
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonRow>
          {logo && (
            <IonCol size="2">
              <IonAvatar>
                <img
                  src={logo}
                  className="h-full"
                  alt="Credential logo"
                />
              </IonAvatar>
            </IonCol>
          )}
          <IonCol size={logo ? '9' : '11'}>
            <IonItem>
              <IonRow>
                <IonLabel className="font-extrabold w-full">{name}</IonLabel>
                <IonLabel
                  className="font-light text-sm"
                  color="medium">
                  {moment(createdOn, 'x').format('DD MMM YYYY hh:mm a')}
                </IonLabel>
              </IonRow>
            </IonItem>
          </IonCol>
          <IonCol size="1">
            <IonIcon
              id={`popover-button-${id}-${name}`}
              icon={ellipsisVertical}
              color="primary"
              className="float-right"
            />
            <IonPopover
              className="scroll-y-hidden"
              trigger={`popover-button-${id}-${name}`}
              dismissOnSelect={true}
              size={'auto'}
              side="bottom"
              ref={popover}
              isOpen={popoverOpen}
              onDidDismiss={() => setPopoverOpen(false)}>
              {type === 'CREDENTIAL' && (
                <IonContent
                  class="ion-padding"
                  onClick={() => handleMoreDetails(data)}>
                  <IonIcon
                    className="align-middle pr-4"
                    icon={informationCircleOutline}
                  />
                  <IonLabel className="align-middle">More details</IonLabel>
                </IonContent>
              )}
              <IonContent
                class="ion-padding"
                onClick={() => onCopy(id)}>
                <IonIcon
                  className="align-middle  pr-4"
                  icon={copyOutline}
                />
                <IonLabel className="align-middle">Copy ID</IonLabel>
              </IonContent>
              <IonContent class="ion-padding">
                <IonIcon
                  className="align-middle  pr-4"
                  icon={trashOutline}
                />
                <IonLabel className="align-middle">Delete</IonLabel>
              </IonContent>
            </IonPopover>
          </IonCol>
        </IonRow>
      </IonCardHeader>
      <IonCardContent>
        <IonItem
          className="ion-activated"
          style={{borderRadius: '10px'}}>
          <IonLabel onClick={() => onCopy(id)}>{id}</IonLabel>
          {qr ? (
            <IonIcon
              icon={qrCodeOutline}
              slot="end"
              onClick={() => handleNavigation(`/did/${id}`)}
            />
          ) : null}
        </IonItem>
      </IonCardContent>
      <IonToast
        color={toastColor}
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        position="top"
        duration="3000"
      />
    </IonCard>
  );
};
