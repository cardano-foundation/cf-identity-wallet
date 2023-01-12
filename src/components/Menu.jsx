import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote } from '@ionic/react';
import React from "react";

import { useLocation } from 'react-router-dom';
import { star, starOutline } from 'ionicons/icons';
import './Menu.css';

const Menu = ({ pages }) => {

	const location = useLocation();

	return (
		<IonMenu contentId="main" type="overlay">
			<IonContent>
				<IonList id="inbox-list">
					<IonListHeader>Overlay Hooks</IonListHeader>
					<IonNote>Choose one below to see a demo</IonNote>

					{ pages.map((appPage, index) => {

						const isSelected = location.pathname === appPage.url;

						return (
							<IonMenuToggle key={ index } autoHide={false}>
								<IonItem className={ isSelected ? 'selected' : '' } routerLink={ appPage.url } routerDirection="none" lines="none" detail={false}>
									<IonIcon slot="start" icon={ isSelected ? star : starOutline } />
									<IonLabel>{ appPage.label }</IonLabel>
								</IonItem>
							</IonMenuToggle>
						);
					})}
				</IonList>
			</IonContent>
		</IonMenu>
	);
};

export default Menu;
