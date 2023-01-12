import React from 'react';
import {IonCol, IonGrid, IonPage, IonRow} from '@ionic/react';
import {addOutline} from 'ionicons/icons';

import './Tab1.css';
import CustomPage from '../main/CustomPage';
import Chats from '../components/chat/Chats';

const Chat = (props) => {
	const pageName = 'Chats';

	return (
		<IonPage id={pageName}>
			<CustomPage
				name={pageName}
				sideMenu={false}
				sideMenuPosition="start"
				backButton={true}
				backButtonText="Home"
				actionButton={true}
				actionButtonIcon={addOutline}
				actionButtonPosition="end"
				actionButtonIconSize="1.7rem">
				<Chats />
			</CustomPage>
		</IonPage>
	);
};

export default Chat;
