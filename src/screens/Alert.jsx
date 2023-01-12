import React from 'react';
import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonPage,
	IonTitle,
	IonToolbar,
	useIonAlert,
} from '@ionic/react';

const Alert = () => {
	const [present] = useIonAlert();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Alert</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Alert</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonButton
					expand="block"
					onClick={() =>
						present({
							cssClass: 'my-css',
							header: 'Alert',
							message: 'alert from hook',
							buttons: [
								'Cancel',
								{text: 'Ok', handler: (d) => console.log('ok pressed')},
							],
							onDidDismiss: (e) => console.log('did dismiss'),
						})
					}>
					Show Alert
				</IonButton>
				<IonButton
					expand="block"
					onClick={() => present('hello with params', [{text: 'Ok'}])}>
					Show Alert using params
				</IonButton>
			</IonContent>
		</IonPage>
	);
};

export default Alert;
