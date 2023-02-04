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
import {arrowForward, informationCircleOutline} from "ionicons/icons";
import {useHistory} from "react-router-dom";

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
        <IonCard color="secondary">
            <IonCardHeader>
                <IonCardTitle style={{fontSize: '20px'}}>{name}</IonCardTitle>
                <IonCardSubtitle>{expDate}</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
                <IonItem className="ion-activated" color="secondary" style={{borderRadius: '10px'}}>
                    <IonIcon icon={informationCircleOutline} slot="start"/>
                    <IonLabel>{id}</IonLabel>
                    <IonIcon icon={arrowForward} slot="end" onClick={() => handleNavigation(`/did/${id}`)}/>
                </IonItem>
            </IonCardContent>
        </IonCard>

    </>
};
