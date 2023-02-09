import React from 'react';
import {useHistory} from 'react-router-dom';
import {useEffect} from 'react';
import {
  IonCol,
  IonGrid,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
  IonToggle,
} from '@ionic/react';
import CustomPage from '../../../main/CustomPage';
import {changeTheme} from '../../../theme/handleTheme';
import {useSideMenuUpdate} from '../../../main/SideMenuProvider';
import Logo from '../../../../public/assets/cardano-logo.png';
import {isDarkMode} from '../../../theme/handleTheme';

const Settings = (props) => {
  const pageName = 'Settings';
  const {sideMenuOptions} = props;
  const setSideMenu = useSideMenuUpdate();
  const history = useHistory();

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
    });
  };

  const handleTheme = () => {
    changeTheme();
  };

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
        name={pageName}
        sideMenu={false}
        sideMenuPosition="start">
        <IonGrid>
          <IonRow className="py-6">
            <IonCol size="12">
              <IonItem>
                <IonImg
                  src={Logo}
                  alt="Cardano Logo"
                  className="w-24 mx-auto"
                />
              </IonItem>
              <IonItem>
                <IonLabel className="text-center mx-auto">
                  Cardano Identity Wallet v0.1.0
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel className="text-center mx-auto">
                  <h2>Upcoming Features:</h2>
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonList>
                <IonItem>
                  <IonLabel>Dark Mode</IonLabel>
                  <IonToggle
                    onIonChange={(_) => handleTheme()}
                    slot="end"
                  />
                </IonItem>
                <IonItem>
                  <IonLabel onClick={() => handleNavigation('/chats')}>
                    P2P Chat (beta)
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Crypto Transactions</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Network Selection</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>DID methods</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Credentials Sharing</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>DIDComm</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>QR Code Scan</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Biometrics Integration</IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>Wallet Back-up</IonLabel>
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      </CustomPage>
    </IonPage>
  );
};

export default Settings;
