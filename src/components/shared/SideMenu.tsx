import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonPage,
  IonRow,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import {changeTheme} from '../../theme/handleTheme';
import LogoDark from '../../assets/cardano-logo.png';
import LogoLight from '../../assets/cardano-logo-white.png';

const SideMenu = () => {
  const history = useHistory();
  const [isDark, setIsDark] = useState(
    document.body.classList.contains('dark')
  );

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
    });
  };

  const handleTheme = () => {
    changeTheme();
    setIsDark(document.body.classList.contains('dark'));
  };
  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonGrid className="px-0">
            <IonRow className="py-6">
              <IonCol
                size="12"
                className="px-0">
                <IonItem>
                  <IonImg
                    src={isDark ? LogoLight : LogoDark}
                    alt="Cardano Logo"
                    className="w-24 mx-auto"
                  />
                </IonItem>
                <IonItem>
                  <IonLabel className="text-center mx-auto">
                    Cardano Identity Wallet v0.1.0
                  </IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonList lines="none">
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle
                onIonChange={(_) => handleTheme()}
                slot="end"
              />
            </IonItem>
            <IonItem>
              <IonMenuToggle>
                <IonLabel onClick={() => handleNavigation('/upcomingfeatures')}>
                  Upcoming Features
                </IonLabel>
              </IonMenuToggle>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            {/* <IonTitle>Menu</IonTitle> */}
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding"></IonContent>
      </IonPage>
    </>
  );
};

export default SideMenu;
