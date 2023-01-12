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
	useIonLoading,
} from '@ionic/react';

const Loading = () => {
	const [present] = useIonLoading();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Loading</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Loading</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonButton
					expand="block"
					onClick={() =>
						present({
							duration: 3000,
						})
					}>
					Show Loading
				</IonButton>
				<IonButton
					expand="block"
					onClick={() => present('Loading', 2000, 'dots')}>
					Show Loading using params
				</IonButton>
			</IonContent>
		</IonPage>
	);
};

export default Loading;
