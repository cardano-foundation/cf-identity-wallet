import React, {useEffect, useState} from 'react';
import {IonButton, IonPage, IonToast} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../layouts/CustomPage';
import {useLocation} from 'react-router-dom';
import {QRCode} from 'react-qrcode-logo';
import Barcode from 'react-barcode';
import {writeToClipboard} from '../../utils/clipboard';
import {extendMoment} from 'moment-range';
import Moment from 'moment';

const moment = extendMoment(Moment);

const Did = (props) => {
  const location = useLocation();
  const pageName = location.state?.name || '';
  const id = location.state?.id || '';
  const createdOn = location.state?.createdOn || '';

  const [showQrcode, setShowQrcode] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  useEffect(() => {}, []);

  const onCopy = (content) => {
    writeToClipboard(content).then(() => {
      setToastColor('success');
      setToastMessage(`Copied: ${content}`);
      setShowToast(true);
    });
  };

  const renderCode = () => {
    if (!id || !id.length) return;
    return showQrcode ? (
      <QRCode
        value={id}
        size={250}
        fgColor={'black'}
        bgColor={'#FFFFFF'}
        qrStyle={'squares'}
        logoImage={
          'https://webisora.com/wp-content/uploads/2017/09/WebisoraLogo_B.png'
        }
        logoWidth={180}
        logoHeight={40}
        logoOpacity={1}
        quietZon={10} //The size of the quiet zone around the QR Code. This will have the same color as QR Code bgColor
      />
    ) : (
      <Barcode
        value={'c56d4cceb8a8550534968e1bf165137a'} // 32 chars
        format={'CODE128'}
        displayValue={false}
        lineColor={'black'}
        background={'white'}
        width={1}
      />
    );
  };

  return (
    <IonPage id={pageName}>
      <CustomPage
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start"
        backButton={true}
        backButtonText="Back"
        backButtonPath={'/tabs/dids'}
        actionButton={false}
        actionButtonIcon={addOutline}
        actionButtonIconSize="1.7rem">
        <div className="">
          <div className="flex flex-col text-center w-full py-8 items-center">
            <p>Share your identity with others</p>
          </div>
          <div className="flex flex-col text-center w-full p-4 items-center">
            <p className="mb-4">
              <span
                onClick={() => setShowQrcode(true)}
                className={!showQrcode ? 'text-gray-600 cursor-pointer' : ''}>
                Qrcode
              </span>
              <span className="text-gray-600"> / </span>
              <span
                onClick={() => setShowQrcode(false)}
                className={showQrcode ? 'text-gray-600 cursor-pointer' : ''}>
                Barcode
              </span>
            </p>
            {renderCode()}
            <p className="mb-4">
              <span className="text-gray-600">Created on:</span>{' '}
              {moment(createdOn, 'x').format('DD MMM YYYY hh:mm a')}
            </p>
          </div>
          <div className="flex flex-col text-center w-full m-1 items-center">
            <p className="mb-4">{id}</p>
            <IonButton
              onClick={() => onCopy(id)}
              shape="round"
              color="dark"
              expand="block">
              Copy ID
            </IonButton>
          </div>
        </div>
      </CustomPage>
      <IonToast
        color={toastColor}
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        position="bottom"
        duration="3000"
      />
    </IonPage>
  );
};

export default Did;
