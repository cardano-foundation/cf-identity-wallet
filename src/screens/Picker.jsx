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
	useIonPicker,
} from '@ionic/react';
import {useState} from 'react';

const Picker = () => {
	const [present] = useIonPicker();
	const [value, setValue] = useState('');

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
					</IonButtons>
					<IonTitle>Picker</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Picker</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonButton
					expand="block"
					onClick={() =>
						present({
							buttons: [
								{
									text: 'Confirm',
									handler: (selected) => {
										setValue(selected.animal.value);
									},
								},
							],
							columns: [
								{
									name: 'animal',
									options: [
										{text: 'Dog', value: 'dog'},
										{text: 'Cat', value: 'cat'},
										{text: 'Bird', value: 'bird'},
									],
								},
							],
						})
					}>
					Show Picker
				</IonButton>
				<IonButton
					expand="block"
					onClick={() =>
						present(
							[
								{
									name: 'animal',
									options: [
										{text: 'Dog', value: 'dog'},
										{text: 'Cat', value: 'cat'},
										{text: 'Bird', value: 'bird'},
									],
								},
								{
									name: 'vehicle',
									options: [
										{text: 'Car', value: 'car'},
										{text: 'Truck', value: 'truck'},
										{text: 'Bike', value: 'bike'},
									],
								},
							],
							[
								{
									text: 'Confirm',
									handler: (selected) => {
										setValue(
											`${selected.animal.value}, ${selected.vehicle.value}`
										);
									},
								},
							]
						)
					}>
					Show Picker using params
				</IonButton>
				{value && <div>Selected Value: {value}</div>}
			</IonContent>
		</IonPage>
	);
};

export default Picker;
