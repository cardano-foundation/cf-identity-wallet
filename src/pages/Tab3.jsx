import React from 'react';
import {useEffect, useState} from 'react';
import {
	checkmarkOutline,
	mailUnreadOutline,
} from 'ionicons/icons';

import './Tab3.css';
import CustomPage from '../main/CustomPage';

import {PageHeader} from '../components/PageHeader';
import {
	IonBadge,
	IonGrid,
	IonItem,
	IonLabel,
	IonList,
	IonNote,
	IonPage, IonToggle,
} from '@ionic/react';
import {getInboxItems} from '../main/Utils';

const Tab3 = (props) => {
	const pageName = 'Settings';

	const [Badge, setBadge] = useState(true);

	const inboxItems = getInboxItems();

	useEffect(() => {
	}, [props.location]);

	const handleTheme = () => {
		// window.matchMedia('(prefers-color-scheme: dark)').matches, match OS preference
		let div = document.getElementById('appWrapper');
		if (document.body.classList.contains('dark')) {
			// Ionic
			document.body.classList.remove('dark');
			// Tailwind
			div.setAttribute("data-theme",'dark');
		} else {
			document.body.classList.toggle('dark', true);
			div.setAttribute("data-theme",'light');
		}
	};

	return (
		<IonPage id={pageName}>
			<CustomPage
				name={pageName}
				sideMenu={true}
				sideMenuPosition="start">
				<IonGrid>
					<PageHeader
						pageName={pageName}
					/>

					<IonList>
						<IonItem>
							<IonLabel>Default Toggle</IonLabel>
							<IonToggle onIonChange={(_) => handleTheme()} slot="end" />
						</IonItem>
						<IonItem>
							<button className="tw-btn tw-btn-info">Info</button>
							<button className="tw-btn tw-btn-success">Success</button>
							<button className="tw-btn tw-btn-warning">Warning</button>
							<button className="tw-btn tw-btn-error">Error</button>
						</IonItem>
						{inboxItems.map((item, index) => {
							return (
								<IonItem
									routerLink={`/tabs/tab3/${item.id}`}
									key={`item_${index}`}
									detail={true}
									lines="full"
									detailIcon={
										item.unread ? mailUnreadOutline : checkmarkOutline
									}>
									<IonLabel>
										<h2>{item.sender}</h2>
										<h4>{item.subject}</h4>
										<p>{item.message}</p>
									</IonLabel>
									{Badge && (
										<IonBadge
											slot="end"
											style={{fontSize: '0.7rem'}}>
											{item.time}
										</IonBadge>
									)}

									{!Badge && (
										<IonNote
											slot="end"
											style={{fontSize: '0.9rem'}}>
											{item.time}
										</IonNote>
									)}
								</IonItem>
							);
						})}
					</IonList>
				</IonGrid>
			</CustomPage>
		</IonPage>
	);
};

export default Tab3;
