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

export const DidCard = ({name}) => (

    <>
        <IonCard color="secondary">
            <IonCardHeader>
                <IonCardTitle>Thomas A. Mayfield</IonCardTitle>
                <IonCardSubtitle>Expiration date</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
                <IonItem className="ion-activated" color="secondary" style={{borderRadius: '10px'}}>
                    <IonIcon icon={informationCircleOutline} slot="start"/>
                    <IonLabel>CfsdfsdvsdfvfcsdCfsdfsdvsdfvfcsd</IonLabel>
                    <IonIcon icon={arrowForward} slot="end"/>
                </IonItem>
            </IonCardContent>
        </IonCard>

    </>
);
