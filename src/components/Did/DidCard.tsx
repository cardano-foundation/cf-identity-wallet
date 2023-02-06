import React from 'react';
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonLabel
} from "@ionic/react";
import {informationCircleOutline, qrCodeOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";
import './did.scss';
import {isDarkMode} from "../../theme/handleTheme";

export const DidCard = ({id, name, expDate}) => {

    const history = useHistory();

    const handleNavigation = (route: string) => {
        history.push({
            pathname: route,
            search: '?update=true', // query string
            state: {
                // location state
                id,
                name,
                expDate
            },
        });
    };

    return <>
        <IonCard style={{borderWidth: 5, borderColor: isDarkMode() ? 'white' : 'black'}}>
            <IonCardHeader>
                <IonCardTitle style={{fontSize: '20px'}}>{name}</IonCardTitle>
                <IonCardSubtitle>{expDate}</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
                <IonItem className="ion-activated" style={{borderRadius: '10px'}}>
                    <IonIcon icon={informationCircleOutline} slot="start"/>
                    <IonLabel>{id}</IonLabel>
                    <IonIcon icon={qrCodeOutline} slot="end" onClick={() => handleNavigation(`/did/${id}`)}/>
                </IonItem>
            </IonCardContent>
        </IonCard>

    </>
};
