import React from 'react';
import {useEffect, useState} from 'react';
import {IonCol, IonGrid, IonImg, IonPage, IonRow, IonText} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';

import {PageHeader} from '../../../components/PageHeader';
import {Modal} from '../../../components/Modal';
import {useSideMenuUpdate, useSideMenu} from '../../../main/SideMenuProvider';
import {tab1SideMenu} from '../../../main/PageSideMenus';

const Dids = (props) => {
	const pageName = 'DIDs';
	const {sideMenuOptions} = props;
	const setSideMenu = useSideMenuUpdate();

	const [showModal, setShowModal] = useState(false);
	const [modalOptions, setModalOptions] = useState(false);

	const handleModal = async (index) => {
		await setModalOptions(tab1SideMenu[index]);
		setShowModal(true);
	};

	//	Access other side menu options here
	const sideMenu = useSideMenu();

	useEffect(() => {
		if (props.location.pathname === '/tabs/dids') {
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
				<PageHeader
					count={sideMenuOptions.length}
					pageName={pageName}
				/>
				<IonGrid>
					<IonRow className="ion-margin">
						<IonCol className="ion-align-self-center ion-margin">
							<IonImg
								className="ion-margin"
								src="/assets/cardano-logo.png"
							/>
						</IonCol>
					</IonRow>
					<IonRow className="ion-text-center">
						<IonCol size="12">
							<IonText
								className="ion-margin"
								color="dark">
								<p>Work in progress...</p>
							</IonText>
						</IonCol>
					</IonRow>
				</IonGrid>

				{showModal && modalOptions && (
					<Modal
						showModal={showModal}
						modalOptions={modalOptions}
						close={() => setShowModal(false)}
					/>
				)}
			</CustomPage>
		</IonPage>
	);
};

export default Dids;
