import React from 'react';
import {
	IonButtons,
	IonContent,
	IonHeader,
	IonItem,
	IonIcon,
	IonLabel,
	IonList,
	IonMenu,
	IonMenuButton,
	IonMenuToggle,
	IonPage,
	IonTitle,
	IonToolbar,
} from '@ionic/react';
import {useSideMenu} from '../main/SideMenuProvider';

import '../theme/SideMenu.css';

const SideMenu = (props) => {
	const {type = 'overlay'} = props;
	const mainContent = props.children;
	const menuOptions = useSideMenu();

	return (
		// <IonMenu
		//   contentId={menuOptions.pageName}
		//   side={menuOptions.side}
		//   type={type}
		// >
		//   <IonHeader>
		//     <IonToolbar>
		//       <IonTitle>Menu</IonTitle>
		//     </IonToolbar>
		//   </IonHeader>

		//   <IonContent forceOverscroll={false} id='main'>
		//     {mainContent}

		//     <IonListHeader>{menuOptions.pageName}</IonListHeader>

		//   </IonContent>
		// </IonMenu>
		<>
			<IonMenu contentId="main-content">
				<IonHeader>
					<IonToolbar>
						<IonTitle>Menu Content</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="ion-padding">
					<IonList lines="none">
						{menuOptions &&
						menuOptions.options.map((menuOption, i) => {
							if (menuOption.url === null) {
								return (
									<IonMenuToggle
										key={i}
										autoHide={true}>
										<IonItem
											onClick={menuOption.clickEvent}
											lines="none"
											detail={false}>
											<IonIcon
												slot="start"
												icon={menuOption.icon}
											/>
											<IonLabel>{menuOption.text}</IonLabel>
										</IonItem>
									</IonMenuToggle>
								);
							} else {
								if (menuOption.url !== null) {
									return (
										<IonMenuToggle
											key={i}
											autoHide={true}>
											<IonItem
												detail={false}
												routerLink={menuOption.url}
												lines="none">
												<IonIcon
													slot="start"
													icon={menuOption.icon}
												/>
												<IonLabel>{menuOption.text}</IonLabel>
											</IonItem>
										</IonMenuToggle>
									);
								}
							}
						})}
					</IonList>
				</IonContent>
			</IonMenu>
			<IonPage id="main-content">
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonMenuButton/>
						</IonButtons>
						<IonTitle>Menu</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="ion-padding">
					Refresh...
				</IonContent>
			</IonPage>
		</>
	);
};

export default SideMenu;
