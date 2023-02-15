import React, {useRef, useState} from 'react';
import {
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCardHeader,
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
import {isDarkMode} from '../../theme/handleTheme';
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
    <>
      <IonCard>
        <IonCardHeader>
          <div className="py-2">
            <IonItem className="w-full">
              {logo ? (
                <IonAvatar slot="start">
                  <img
                    alt="Silhouette of a person's head"
                    src={logo}
                  />
                </IonAvatar>
              ) : null}
              <IonRow className={`${!logo || !logo.length ? 'pl-4' : ''}`}>
                <IonLabel className="font-extrabold w-full">{name}</IonLabel>

                <IonLabel className="font-light text-gray-600 text-sm">
                  {moment(createdOn, 'x').format('DD MMM YYYY hh:mm a')}
                </IonLabel>
              </IonRow>
              <IonIcon
                id={`popover-button-${id}-${name}`}
                icon={ellipsisVertical}
                className="float-right"
                slot="end"
              />
            </IonItem>
            <IonPopover
              className="scroll-y-hidden"
              trigger={`popover-button-${id}-${name}`}
              dismissOnSelect={true}
              size={'auto'}
              side="bottom"
              ref={popover}
              isOpen={popoverOpen}
              onDidDismiss={() => setPopoverOpen(false)}>
              <>
                {type === 'CREDENTIAL' && (
                  <IonRow>
                    <IonItem
                      className="px-4 py-2"
                      onClick={() => handleMoreDetails(data)}>
                      <IonIcon
                        slot="start"
                        icon={informationCircleOutline}
                      />
                      <IonLabel> More details</IonLabel>
                    </IonItem>
                  </IonRow>
                )}
                <IonRow>
                  <IonItem
                    className="px-4 py-2"
                    onClick={() => onCopy(id)}>
                    <IonIcon
                      slot="start"
                      icon={copyOutline}
                    />
                    <IonLabel> Copy ID</IonLabel>
                  </IonItem>
                </IonRow>
                <IonRow>
                  <IonItem className="px-4 py-2">
                    <IonIcon
                      slot="start"
                      icon={trashOutline}
                    />
                    <IonLabel>Delete</IonLabel>
                  </IonItem>
                </IonRow>
              </>
            </IonPopover>
          </div>
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
    </>
  );
};
