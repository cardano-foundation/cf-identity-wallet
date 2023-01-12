import React from 'react';
import {
	IonGrid,
	IonRow,
	IonCol,
	IonModal,
	IonButtons,
	IonButton,
	IonIcon,
	IonContent,
	IonHeader,
	IonToolbar,
	IonTitle,
} from '@ionic/react';
import {chevronBack} from 'ionicons/icons';

export const Modal = (props) => (
	<IonModal isOpen={props.showModal}>
		<IonHeader>
			<IonToolbar>
				<IonTitle>
					{props.modalOptions.text
						? props.modalOptions.text
						: props.modalOptions.name}
				</IonTitle>
				<IonButtons slot="start">
					<IonButton onClick={() => props.close(false)}>
						<IonIcon
							size="large"
							icon={chevronBack}
							style={{marginLeft: '-0.7rem'}}
						/>
					</IonButton>
				</IonButtons>
			</IonToolbar>
		</IonHeader>

		<IonContent fullscreen>
			<IonGrid>
				<IonRow className="ion-text-center ion-margin-top">
					<IonCol size="12">
						<IonIcon
							style={{fontSize: '5rem'}}
							icon={props.modalOptions.icon}
						/>
					</IonCol>
				</IonRow>

				{props.modalOptions.name && (
					<IonRow className="ion-text-center">
						<IonCol size="12">
							<h3>{props.modalOptions.name}</h3>
						</IonCol>
					</IonRow>
				)}
			</IonGrid>
		</IonContent>
	</IonModal>
);
