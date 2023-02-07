import React, {useRef, useState} from 'react';
import {
    IonAvatar,
    IonCard,
    IonCardContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonPopover,
    IonRow,
    IonToast
} from "@ionic/react";
import {copyOutline, ellipsisVertical, informationCircleOutline, qrCodeOutline, trashOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";
import './did.scss';
import {isDarkMode} from "../../theme/handleTheme";
import {writeToClipboard} from "../../utils/clipboard";
import {extendMoment} from 'moment-range';
import Moment from 'moment';

const moment = extendMoment(Moment);

export const DidCard = ({id, name, logo, createdOn}) => {

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

    const handleNavigation = (route: string) => {
        history.push({
            pathname: route,
            search: '?update=true', // query string
            state: {
                // location state
                id,
                name,
                createdOn
            },
        });
    };

    const onCopy = (content) => {
        writeToClipboard(content).then(() => {
            setToastColor('success');
            setToastMessage(`Copied: ${content}`);
            setShowToast(true);
        });
    };

    return <>
        <IonCard style={{borderWidth: 0, borderColor: isDarkMode() ? 'white' : 'black'}}>

            <div className="py-2">
                <IonItem>
                    {logo && logo.length ?
                        <IonAvatar slot="start">
                            <img alt="Silhouette of a person's head" src={logo}/>
                        </IonAvatar> : null}
                    <IonRow className={`${!logo || !logo.length ? 'pl-4' : ''}`}>
                        <IonLabel className="font-extrabold w-full">{name}</IonLabel>

                        <IonLabel
                            className="font-light text-gray-600 text-sm">{moment(createdOn, "x").format("DD MMM YYYY hh:mm a")}</IonLabel>
                    </IonRow>
                    <IonIcon id={`popover-button-${id}`} icon={ellipsisVertical} className="float-right"/>
                </IonItem>
                <IonPopover
                    className='scroll-y-hidden'
                    trigger={`popover-button-${id}`}
                    dismissOnSelect={true}
                    size={'auto'}
                    side="bottom"
                    ref={popover}
                    isOpen={popoverOpen}
                    onDidDismiss={() => setPopoverOpen(false)}>
                    <>
                        <IonRow>
                            <IonItem className="px-4 py-2" onClick={() => handleNavigation(`/did/${id}`)}>
                                <IonIcon slot="start" icon={informationCircleOutline}/>
                                <IonLabel> More details</IonLabel>
                            </IonItem>
                        </IonRow>
                        <IonRow>
                            <IonItem className="px-4 py-2" onClick={() => onCopy(id)}>
                                <IonIcon slot="start" icon={copyOutline}/>
                                <IonLabel> Copy ID</IonLabel>
                            </IonItem>
                        </IonRow>
                        <IonRow>
                            <IonItem className="px-4 py-2">
                                <IonIcon slot="start" icon={trashOutline}/>
                                <IonLabel>Delete</IonLabel>
                            </IonItem>
                        </IonRow>
                    </>
                </IonPopover>
            </div>

            <IonCardContent>
                <IonItem className="ion-activated" style={{borderRadius: '10px'}}>
                    <IonIcon icon={informationCircleOutline} slot="start"
                             onClick={() => handleNavigation(`/did/${id}`)}/>
                    <IonLabel onClick={() => onCopy(id)}>{id}</IonLabel>
                    <IonIcon icon={qrCodeOutline} slot="end" onClick={() => handleNavigation(`/did/${id}`)}/>
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
};
