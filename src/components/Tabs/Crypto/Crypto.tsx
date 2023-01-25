import React from 'react';
import {useEffect} from 'react';
import {IonCol, IonGrid, IonPage, IonRow} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {PageHeader} from '../../../components/PageHeader';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';

const Crypto = (props) => {
	const pageName = 'Crypto';
	const {sideMenuOptions} = props;
	const setSideMenu = useSideMenuUpdate();

	useEffect(() => {
		if (props.location.pathname === '/tabs/crypto') {
			setSideMenu({
				options: sideMenuOptions,
				side: 'start',
				pageName: pageName,
			});
		}
	}, [props.location]);

	return (
		<IonPage id={pageName}>
			<CustomPage
				// Adds title next to hamburger menu
				// name={pageName}
				sideMenu={true}
				sideMenuPosition="start">
				<PageHeader pageName={pageName} />
				<IonGrid>
					<IonRow className="ion-margin">
						<IonCol className="ion-align-self-center ion-margin"></IonCol>
					</IonRow>
				</IonGrid>
			</CustomPage>
		</IonPage>
	);
};

export default Crypto;
