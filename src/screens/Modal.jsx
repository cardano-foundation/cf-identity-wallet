import React from 'react';
import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonMenuButton,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar,
	useIonModal,
} from '@ionic/react';
import {useState} from 'react';

const Modal = () => {
	const Body = ({count, onDismiss, onIncrement}) => (
		<div className="ion-text-center">
			<IonText
				color="dark"
				className="ion-text-center">
				Count: {count}
			</IonText>
			<IonButton
				expand="block"
				onClick={() => onIncrement()}>
				Increment Count
			</IonButton>
			<IonButton
				expand="block"
				onClick={() => onDismiss()}>
				Close
			</IonButton>
		</div>
	);

	const [count, setCount] = useState(0);

	const handleIncrement = () => {
		setCount(count + 1);
	};

	const handleDismiss = () => {
		dismiss();
	};

	const [present, dismiss] = useIonModal(Body, {
		count,
		onDismiss: handleDismiss,
		onIncrement: handleIncrement,
	});

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Modal</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Modal</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonButton
					expand="block"
					onClick={() => {
						present({
							cssClass: 'my-class',
						});
					}}>
					Show Modal
				</IonButton>
				<div>Count: {count}</div>
			</IonContent>
		</IonPage>
	);
};

export default Modal;
