import React, {useEffect, useState} from 'react';
import {IonPage,} from '@ionic/react';
import {addOutline} from 'ionicons/icons';
import CustomPage from '../main/CustomPage';
import {useLocation} from "react-router-dom";
import {QRCode} from "react-qrcode-logo";
import Barcode from "react-barcode";

const Did = (props) => {

    const location = useLocation();
    const pageName = location.state?.name;

    const [code, setCode] = useState("Hello world!");

    useEffect(() => {
    }, []);
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
                <div className=''>
                    <div className="flex flex-col text-center w-full p-4 items-center">
                        <QRCode
                            value={pageName}
                            size={250}
                            fgColor={'black'}
                            bgColor={'#FFFFFF'}
                            qrStyle={'squares'}
                            logoImage={'https://webisora.com/wp-content/uploads/2017/09/WebisoraLogo_B.png'}
                            logoWidth={180}
                            logoHeight={40}
                            logoOpacity={1}
                            quietZon={10} //The size of the quiet zone around the QR Code. This will have the same color as QR Code bgColor
                        />
                    </div>
                    <div className="flex flex-col text-center w-full p-4 items-center">
                        <Barcode
                            value={pageName}
                            format={'CODE128'}
                            displayValue={false}
                            lineColor={'black'}
                            background={'white'}
                            width={1}
                        />
                    </div>
                </div>
            </CustomPage>
      </IonPage>
  );
};

export default Did;
