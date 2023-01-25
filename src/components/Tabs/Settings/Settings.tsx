import React from 'react';
import {useEffect, useState} from 'react';
import {
	IonCol,
	IonGrid,
	IonImg,
	IonItem,
	IonLabel,
	IonList,
	IonPage,
	IonRow,
	IonText,
	IonToggle,
} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {changeTheme} from '../../../theme/handleTheme';
import {PageHeader} from '../../../components/PageHeader';
import {Modal} from '../../../components/Modal';
import {useSideMenuUpdate, useSideMenu} from '../../../main/SideMenuProvider';
import {tab1SideMenu} from '../../../main/PageSideMenus';

const Settings = (props) => {
	const pageName = 'Settings';
	const {sideMenuOptions} = props;
	const setSideMenu = useSideMenuUpdate();
	const [showModal, setShowModal] = useState(false);
	const [modalOptions, setModalOptions] = useState(false);

	const handleModal = async (index) => {
		await setModalOptions(tab1SideMenu[index]);
		setShowModal(true);
	};

	const handleTheme = () => {
		changeTheme();
	};

	//	Access other side menu options here
	const sideMenu = useSideMenu();

	useEffect(() => {
		if (props.location.pathname === '/tabs/settings') {
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
					<IonList>
						<IonItem>
							<IonLabel>Dark Mode</IonLabel>
							<IonToggle
								onIonChange={(_) => handleTheme()}
								slot="end"
							/>
						</IonItem>
					</IonList>
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

export default Settings;
