import React from 'react';
import {useEffect, useState} from 'react';
import {
	checkmarkOutline,
	mailUnreadOutline,
} from 'ionicons/icons';

import './Tab3.css';
import CustomPage from '../main/CustomPage';
import {useHistory} from 'react-router-dom';
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

	const history = useHistory();

	useEffect(() => {
	}, [props.location]);

	const handleNavigation = () => {
		history.push({
			pathname: '/settings',
			search: '?update=true',  // query string
			state: {  // location state
				update: true,
			},
		});
	}
	const handleTheme = () => {
		console.log("handleTheme");

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
							<IonLabel>Dark Mode</IonLabel>
							<IonToggle onIonChange={(_) => handleTheme()} slot="end" />
						</IonItem>
						<IonItem>
							<button onClick={() => handleNavigation()} className="daisy-btn daisy-btn-info">Info</button>
							<button className="daisy-btn daisy-btn-success">Success</button>
							<button className="daisy-btn daisy-btn-warning">Warning</button>
							<button className="daisy-btn daisy-btn-error">Error</button>
						</IonItem>
						<IonItem>
							<div className="daisy-drawer">
								<input id="my-drawer" type="checkbox" className="daisy-drawer-toggle" />
								<div className="daisy-drawer-content">
									<label htmlFor="my-drawer" className="daisy-btn daisy-btn-primary daisy-drawer-button">Open drawer</label>
								</div>
								<div className="daisy-drawer-side">
									<label htmlFor="my-drawer" className="daisy-drawer-overlay"></label>
									<ul className="daisy-menu p-4 w-80 daisy-bg-base-100 daisy-text-base-content">
										<li><a>Sidebar Item 1</a></li>
										<li><a>Sidebar Item 2</a></li>

									</ul>
								</div>
							</div>
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
