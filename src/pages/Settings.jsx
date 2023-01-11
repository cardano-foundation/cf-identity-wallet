import { IonCol, IonGrid, IonPage, IonRow } from '@ionic/react';
import { addOutline } from 'ionicons/icons';

import './Tab1.css';
import CustomPage from "../main/CustomPage";

const Settings = props => {

	const pageName = "Settings";

	return (
		<IonPage id={ pageName }>
			<CustomPage name={ pageName } sideMenu={ false } sideMenuPosition="start" backButton={ true } backButtonText="Profile" actionButton={ true } actionButtonIcon={ addOutline } actionButtonPosition="end" actionButtonIconSize="1.7rem">
				<IonGrid>
					
					<IonRow className="ion-text-center">
                        <IonCol size="12">
                            <h3>Sub page</h3>
                        </IonCol>
                    </IonRow>
				</IonGrid>
			</CustomPage>
		</IonPage>
	);
}

export default Settings;
