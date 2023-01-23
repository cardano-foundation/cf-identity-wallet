import React from 'react';
import {IonIcon} from '@ionic/react';
import {checkmarkDone, star} from 'ionicons/icons';

export const ChatBottomDetails = ({message}) => (
	<span
		className="chat-bottom-details"
		id={`chatTime_${message.id}`}>
		<span>{message.date}</span>
		{message.sent && (
			<IonIcon
				icon={checkmarkDone}
				color={message.received ? 'primary' : 'gray'}
				style={{fontSize: '0.8rem'}}
			/>
		)}
		{message.starred && <IonIcon icon={star} />}
	</span>
);
